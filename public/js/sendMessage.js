/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/sendMessage.js":
/*!*******************************!*\
  !*** ./src/js/sendMessage.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n(function() {\r\n\r\n    const sendBtn = document.querySelectorAll('.send-message');\r\n    const token = document.querySelector('meta[name=\"csrf-token\"]').getAttribute('content');\r\n\r\n    sendBtn.forEach(btn => {\r\n        btn.addEventListener('click', contactMessage)\r\n    });\r\n\r\n    async function contactMessage(e) {\r\n\r\n        const { errors } = e.target.dataset;\r\n\r\n        try {\r\n            const url = '/contacto';\r\n\r\n                if (!errors) {\r\n\r\n                    window.location = url;\r\n\r\n                    fetch(url, {\r\n                        method: 'GET',\r\n                        headers: {\r\n                            'CSRF-Token': token\r\n                        }\r\n                    });\r\n\r\n                    Swal.fire({\r\n                        position: \"center\",\r\n                        icon: \"success\",\r\n                        title: \"¡Gracias por contactarnos!\",\r\n                        showConfirmButton: false,\r\n                        timer: 2000\r\n                    });\r\n                }\r\n\r\n        } catch (error) {\r\n            console.log(error);\r\n        }\r\n\r\n    }\r\n\r\n})()\n\n//# sourceURL=webpack://bienesraices_mvc/./src/js/sendMessage.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/sendMessage.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;