import { unlink } from 'node:fs/promises';
import colors from 'colors';
import { Sequelize } from "sequelize";
import { validationResult } from 'express-validator';
import { Price, Category, Property, User, Message, Image } from '../models/index.js';
import { propertyPrice } from "../helpers/priceFormat.js";
import { isSeller, sentMessage, dateFormat } from "../helpers/index.js";

const admin = async (req, res) => {

    // Leer QueryString
    const { pagina: actualPage } = req.query;

    const expression = /^[1-9]$/;

    if (!expression.test(actualPage)) {
        return res.redirect('/mis-propiedades?pagina=1');
    }

    try {
        
        const { id, seller, admin, master } = req.user;

        // Limites y Offset para el paginador
        const limit = 10;
        const offset = ((actualPage * limit) - limit);

        if (admin || master) {
            const [ properties, total ] = await Promise.all([
    
                Property.findAll({
                    limit,
                    offset,
                    where: {
                        visible: true
                    },
                    include: [
                        { model: Category, as: 'category' },
                        { model: Price, as: 'price' },
                        { model: Message, as: 'messages' },
                        { model: Image, as: 'images' }
                    ],
                    order: [
                        ['createdAt', 'DESC']
                    ]
                }),
                Property.count({
                    where: {
                        visible: true
                    }
                })
            ]);
    
            res.render('properties/admin', {
                pagina: 'Mis Propiedades',
                csrfToken: req.csrfToken(),
                properties,
                pages: Math.ceil(total / limit),
                actualPage: Number(actualPage),
                total,
                offset,
                limit,
                user: req.user,
                propertyPrice,
                dateFormat
            });
        } else {
            const [ properties, total ] = await Promise.all([
    
                Property.findAll({
                    limit,
                    offset,
                    where: {
                        userId: id,
                        visible: true
                    },
                    include: [
                        { model: Category, as: 'category' },
                        { model: Price, as: 'price' },
                        { model: Message, as: 'messages' },
                        { model: Image, as: 'images' }
                    ],
                    order: [
                        ['createdAt', 'DESC']
                    ]
                }),
                Property.count({
                    where: {
                        userId: id,
                        visible: true
                    }
                })
            ]);
    
            res.render('properties/admin', {
                pagina: 'Mis Propiedades',
                csrfToken: req.csrfToken(),
                properties,
                pages: Math.ceil(total / limit),
                actualPage: Number(actualPage),
                total,
                offset,
                limit,
                user: req.user,
                propertyPrice
            });
        }
    } catch (error) {
        console.log(error);
    }
};
// Buscar propiedad por titulo
const search = async (req, res) => {
    const { search } = req.body;
    const { id, seller, admin, master } = req.user;

    // Validar que search no este vacío
    if (!search.trim()) {
        return res.redirect('back');
    }

    if (admin || master) {
        // Consultar las propiedades sidno admin o master
        const [ prices, categories, properties ] = await Promise.all([
            Price.findAll({ raw: true }),
            Category.findAll({ raw: true }),
            Property.findAll({
                where: {
                    title: {
                        [Sequelize.Op.like] : '%' + search + '%'
                    },
                    visible: true
                },
                include: [
                    { model: Category, as: 'category' },
                    { model: Price, as: 'price' },
                    { model: Message, as: 'messages' },
                    { model: Image, as: 'images' }
                ]
            })
        ])

        res.render('properties/search', {
            pagina: `Resultados de la busqueda: ${search}`,
            csrfToken: req.csrfToken(),
            properties,
            categories,
            prices,
            user: req.user,
            propertyPrice
        })
    } else {
        // Consultar las propiedades siendo solo vendedor
        const [ prices, categories, properties ] = await Promise.all([
            Price.findAll({ raw: true }),
            Category.findAll({ raw: true }),
            Property.findAll({
                where: {
                    title: {
                        [Sequelize.Op.like] : '%' + search + '%'
                    },
                    userId: id,
                    visible: true
                },
                include: [
                    { model: Category, as: 'category' },
                    { model: Price, as: 'price' },
                    { model: Message, as: 'messages' },
                    { model: Image, as: 'images' }
                ]
            })
        ])

        res.render('properties/search', {
            pagina: `Resultados de la busqueda: ${search}`,
            csrfToken: req.csrfToken(),
            properties,
            categories,
            prices,
            user: req.user,
            propertyPrice
        })
    }
};

// Categorias
const category = async (req, res) => {
    const { id } = req.params;

    // Comprobar que la categoria exista
    const category = await Category.findByPk(id)
    if(!category) {
        return res.redirect('/404');
    }

    // Obtener las propiedades de la categoria
    const properties = await Property.findAll({
        where: {
            categoryId: id
        }, 
        include: [
            { model: Price, as: 'price'},
            { model: Category, as: 'category'},
            { model: Message, as: 'messages' },
            { model: Image, as: 'images' },
        ]
    });

    res.render('properties/adminCategory', {
        pagina: `${category.name}`,
        properties,
        csrfToken: req.csrfToken(),
        user: req.user,
        propertyPrice
    });

};

// Formulario para agregar una nueva propiedad
const newProperty = async (req, res) => {
    // Consultar el modelo de Precios y Categorías
    const [categories, prices] = await Promise.all([
        Category.findAll(),
        Price.findAll()
    ]);

    res.render('properties/newProperty', {
        pagina: 'Nueva Propiedad',
        csrfToken: req.csrfToken(),
        user: req.user,
        categories,
        prices,
        data: {}
    })
};
// Guardar la información en la BD
const saveProperty = async (req, res) => {
    // Validación 
    let result = validationResult(req);

    if(!result.isEmpty()) {
        // Consultar el modelo de Precios y Categorías
        const [categories, prices] = await Promise.all([
            Category.findAll(),
            Price.findAll()
        ])

        return res.render('properties/newProperty', {
            pagina: 'Nueva Propiedad',
            csrfToken: req.csrfToken(),
            categories,
            prices,
            errors: result.array(),
            data: req.body,
            user: req.user
        })
    }

    // Crear un registro
    const { title, antiquity, landArea, builtArea, realPrice, bedrooms, wc, garage, floors, sellRent, creditCash, pets, pool, description, 
            contactName, contactTel, secondContactName, secondContactTel, exclusive, commission,
            address, city, lat, lng, category: categoryId, visible = 1, price: priceId } = req.body;
    
    const { id: userId } = req.user;

    try {
        const propertySaved = await Property.create({
            title,
            antiquity,
            landArea,
            builtArea,
            realPrice,
            bedrooms,
            wc,
            garage,
            floors,
            sellRent,
            creditCash,
            pets,
            pool,
            description,
            contactName,
            contactTel,
            secondContactName,
            secondContactTel,
            exclusive,
            commission,
            address,
            city,
            lat,
            lng,
            visible,
            priceId,
            categoryId,
            userId
        });

        const { id } = propertySaved;

        res.redirect(`/propiedades/agregar-imagen/${id}`);

    } catch (error) {
        console.log(error);
    }
}
// Agregar imagen
const addImage = async (req, res) => {

    const { id } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad existe
    const property = await Property.findByPk(id);

    if (!property) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no este publicada
    if (property.published) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta página o que sea admin o master
    if (!master && !admin && seller) {

        if(userId.toString() !== property.userId.toString()) {
            return res.redirect('/mis-propiedades');
        }
    }

    res.render('properties/addImage', {
        pagina: `Añadir Imagenes: ${property.title}`,
        csrfToken: req.csrfToken(),
        property,
        user: req.user
    })
};
// Editar imagen
const editImage = async (req, res) => {

    const { id } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad existe
    const [property, images] = await Promise.all([
        Property.findByPk(id),
        Image.findAll({  where: { propertyId: id } })
    ]);

    if (!property) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta página o que sea admin o master
    if (!master && !admin && seller) {

        if(userId.toString() !== property.userId.toString()) {
            return res.redirect('/mis-propiedades');
        }
    }

    res.render('properties/editImage', {
        pagina: `Editar Imagenes: ${property.title}`,
        csrfToken: req.csrfToken(),
        property,
        images,
        user: req.user
    })
};
// Añadir imagen
const addNewImage = async (req, res) => {

    const { id } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad existe
    const [property, images] = await Promise.all([
        Property.findByPk(id),
        Image.findAll({  where: { propertyId: id } })
    ]);

    // Validar que la propiedad pertenece a quien visita esta página o que sea admin o master
    if (!master && !admin && seller) {

        if(userId.toString() !== property.userId.toString()) {
            return res.redirect('/mis-propiedades');
        }
    }

    res.render('properties/addNewImage', {
        pagina: `Añadir Nuevas Imagenes: ${property.title}`,
        csrfToken: req.csrfToken(),
        property,
        images,
        user: req.user
    })
};

// Guardar las nuevas imagenes en la BD
const storeNewImage = async (req, res) => {
    const { id: propertyId } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad existe
    const property = await Property.findByPk(propertyId);

    if (!property) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta página o que sea admin o master
    if (!master && !admin && seller) {

        if(userId.toString() !== property.userId.toString()) {
            return res.redirect('/mis-propiedades');
        }
    }

    // Obtener la información
    try {
        const images = await Image.create({
            name: req.files[0].filename,
            propertyId,
            userId
        });

        const imagesSaved = await images.save();

        if (imagesSaved) {
            res.redirect('/mis-propiedades');
        }

    } catch (error) {
        console.log(error)
    }
};

// Guardar la imagen en la BD
const storeImage = async (req, res) => {
    const { id: propertyId } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad existe
    const property = await Property.findByPk(propertyId);

    if (!property) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no este publicada
    if (property.published) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta página o que sea admin o master
    if (!master && !admin && seller) {

        if(userId.toString() !== property.userId.toString()) {
            return res.redirect('/mis-propiedades');
        }
    }

    // Obtener la información
    try {
        const images = await Image.create({
            name: req.files[0].filename,
            propertyId,
            userId
        });

        const imagesSaved = await images.save();

        // Almacenar la imagen y publicar la propiedad
        if (imagesSaved) {
            res.redirect('/mis-propiedades');
        }

    } catch (error) {
        console.log(error)
    }
};

const deleteImage = async (req, res) => {
    const { id } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad exista
    const image = await Image.findByPk(id);

    if (!image) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta página o que sea admin o master
    if (!master && !admin && seller) {
        if (image.userId.toString() !== userId.toString()) {
            return res.redirect('/mis-propiedades');
        }
    }

    // Eliminar la imagen del storage
    await unlink(`public/uploads/${image.name}`);

    // Eliminar la imagen de la bd
    await image.destroy();
    return res.redirect(`/propiedades/editar-imagen/${image.propertyId}`);
};

// Formulario para editar una propiedad
const editProperty = async (req, res) => {

    const { id } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad exista
    const property = await Property.findByPk(id);

    if (!property) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta página o que sea admin o master
    if (!master && !admin && seller) {

        if(userId.toString() !== property.userId.toString()) {
            return res.redirect('/mis-propiedades');
        }
    }

    // Consultar el modelo de Precios y Categorías
    const [categories, prices] = await Promise.all([
        Category.findAll(),
        Price.findAll()
    ]);

    res.render('properties/editProperty', {
        pagina: `Editar Propiedad: ${property.title}`,
        csrfToken: req.csrfToken(),
        categories,
        prices,
        data: property,
        user: req.user
    })
};
// Guardar los cambios
const saveChanges = async (req, res) => {
    const { id: userId, master, admin, seller } = req.user;

    // Verificar la validación 
    let result = validationResult(req);

    if(!result.isEmpty()) {
        // Consultar el modelo de Precios y Categorías
        const [categories, prices] = await Promise.all([
            Category.findAll(),
            Price.findAll()
        ]);

        return res.render('properties/editProperty', {
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categories,
            prices,
            errors: result.array(),
            data: req.body,
            user: req.user
        })
    }

    const { id } = req.params;

    // Validar que la propiedad exista
    const property = await Property.findByPk(id);

    if (!property) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta página o que sea admin o master
    if (!master && !admin && seller) {
        if (property.userId.toString() !== userId.toString()) {
            return res.redirect('/mis-propiedades');
        }
    }

    // Reescribir y actualizar el objeto
    try {
        const { title, antiquity, landArea, builtArea, realPrice, bedrooms, wc, garage, floors, sellRent, creditCash, pets, pool, description, 
                contactName, contactTel, secondContactName, secondContactTel, exclusive, commission,
                address, city, lat, lng, category: categoryId, published = 0, visible = 1, price: priceId } = req.body;

        property.set({
            title,
            antiquity,
            landArea,
            builtArea,
            realPrice,
            bedrooms,
            wc,
            garage,
            floors,
            sellRent,
            creditCash,
            pets,
            pool,
            description,
            contactName,
            contactTel,
            secondContactName,
            secondContactTel,
            exclusive,
            commission,
            address,
            city,
            lat,
            lng,
            published,
            visible,
            priceId,
            categoryId
        });

        await property.save();

        res.redirect('/mis-propiedades');

    } catch (error) {
        console.log(error)
    }
};

// Modifica el estado de la propiedad
const changeStatus = async (req, res) => {
    const { id } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad exista
    const property = await Property.findByPk(id);

    if (!property) {
        return res.redirect('/mis-propiedades');
    }

    // Revisar que quien visita la URL, es quien creo la propiedad
    if (!master && !admin) {
        return res.redirect('/mis-propiedades');
    }

    // Actualizar
    property.published = !property.published

    await property.save();

    res.json({
        status : true
    });
};

const deleteProperty = async (req, res) => {
    const { id } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad exista
    const property = await Property.findByPk(id);

    if (!property) {
        return res.redirect('/mis-propiedades');
    }

    // Revisar que quien visita la URL, es master
    if (!master) {
        return res.redirect('/mis-propiedades');
    }

    try {
        // Eliminar la propiedad de la web pero no de la BD
        property.visible = 0;
        property.published = 0;

        await property.save();

        res.redirect('/mis-propiedades');

    } catch (error) {
        console.log(error)
    }
};

// Muestra una propiedad
const showProperty = async (req, res) => {

    const { id } = req.params;

    // Comprobar que la propiedad exista
    if (req.user) {
        
        const [ property, image, message ] = await Promise.all([
            Property.findByPk(id, {
                include: [
                    { model: Price, as: 'price' },
                    { model: Category, as: 'category' },
                    { model: Image, as: 'images' },
                    { model: Message, as: 'messages' }
                ]
            }),
            Image.findAll({ where: { propertyId: id } }),
            Message.findAll({ where: { propertyId: id, userId: req.user.id } }),
        ]);

        if (!property || !property.published) {
            return res.redirect('/404');
        }
    console.log(req.user.id)
        res.render('properties/showProperty', {
            property,
            image,
            message,
            pagina: property.title,
            csrfToken: req.csrfToken(),
            propertyPrice,
            user: req.user,
            isSeller: isSeller(req.user?.id, property.userId)
        });
    } else {
        const [ property, image ] = await Promise.all([
            Property.findByPk(id, {
                include: [
                    { model: Price, as: 'price' },
                    { model: Category, as: 'category' },
                    { model: Image, as: 'images' },
                    { model: Message, as: 'messages' }
                ]
            }),
            Image.findAll({ where: { propertyId: id } }),
        ]);

        if (!property || !property.published) {
            return res.redirect('/404');
        }
    // console.log(req.user?.id)
        res.render('properties/showProperty', {
            property,
            image,
            pagina: property.title,
            csrfToken: req.csrfToken(),
            propertyPrice,
            user: req.user,
            isSeller: isSeller(req.user?.id, property.userId)
        });
    }
};

const showImages = async (req, res) => {

    const { id } = req.params;

    // Comprobar que la propiedad exista
    const [ property, images, ] = await Promise.all([
        Property.findAll({ where: { id: id } }),
        Image.findAll({ 
            where: { propertyId: id },
            include: [
                { model: Property, as: 'property' },
            ]
        })
    ]);

    res.render('properties/showImage', {
        pagina: `Imagenes de la propiedad ${property[0].title}`,
        property,
        images,
        csrfToken: req.csrfToken(),
        user: req.user
    });
}

const sendMessage = async (req, res) => {
    const { id } = req.params;

    // Comprobar que la propiedad exista
    const property = await Property.findByPk(id, {
        include: [
            { model: Price, as: 'price' },
            { model: Category, as: 'category' },
            { model: Image, as: 'images' },
            { model: Message, as: 'messages' },
        ]
    });

    if (!property) {
        return res.redirect('/404');
    } 

    // Validación 
    let result = validationResult(req);

    if(!result.isEmpty()) {

        return res.render('properties/showProperty', {
            property,
            pagina: property.title,
            csrfToken: req.csrfToken(),
            price: propertyPrice(property.realPrice),
            user: req.user,
            propertyPrice,
            isSeller: isSeller(req.user?.id, property.userId),
            errors: result.array()
        });
    }

    // Obtener la información
    const { message } = req.body;
    const { id: propertyId } = req.params;
    const { id: userId } = req.user;

    // Almacenar la información
    await Message.create({
        message,
        propertyId,
        userId
    });

    // PENDIENTE...............
    // sendEmailVerification({
    //     title: property.title
    // });

    res.redirect('/');
};

// Leer mensajes recibidos
const watchMessage = async (req, res) => {
    const { id } = req.params;
    const { id: userId, master, admin, seller } = req.user;

    // Validar que la propiedad exista
    const property = await Property.findByPk(id, {
        include: [
            { model: Message, as: 'messages',
                include: [
                    { model: User.scope('deletePassword'), as: 'user' }
                ]
            }
        ]
    });
    if (!property) {
        return res.redirect('/mis-propiedades');
    }

    // Revisar que quien visita la URL, es master o admin
    if (!master && !admin) {

        return res.redirect('/mis-propiedades');
    }

    res.render('properties/messages', {
        pagina: 'Mensajes',
        messages: property.messages,
        user: req.user,
        dateFormat
    });
};

export {
    admin,
    search,
    category,
    newProperty,
    saveProperty,
    addImage,
    editImage,
    addNewImage,
    storeNewImage,
    storeImage,
    deleteImage,
    editProperty,
    saveChanges,
    changeStatus,
    deleteProperty,
    showProperty,
    showImages,
    sendMessage,
    watchMessage
}