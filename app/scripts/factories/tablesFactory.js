'use strict';
/**
 * @ngdoc function
 * @name posBOApp.tablesFactory
 * @description 
 * # TablesFactory return models and function transformation of widgets
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('tablesFactory',['$http', '$rootScope','config','auth', function ($http, $rootScope,config,auth) { //maps ID with VALUE in select form  to display in drop down ui-grid CELL
        var retFactory = {};
        var authSpecs = auth.getLoggedSpecs();
        var Imageprefix = config.WebApiURL.slice(0, -1) + '/images/' + authSpecs.storeId + '/storeregion/';
        retFactory.models = function () {
            var modelsArr = [];
            //.............. graphics
            modelsArr.push({ name: "(2x2) Round", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/graphics/g22rc3a.png', ImageName: 'g22rc3a.png', Capacity: 3, imgType: 'Graphics' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/graphics/g22qc4.png', ImageName: 'g22qc4.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/graphics/g22qc4a.png', ImageName: 'g22qc4a.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/graphics/g22qc4b.png', ImageName: 'g22qc4b.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/graphics/g22qc4c.png', ImageName: 'g22qc4c.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(2x2) Round", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/graphics/g22rc4a.png', ImageName: 'g22rc4a.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(2x2) Round", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/graphics/g22rc4b.png', ImageName: 'g22rc4b.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(2x3) Square", sizeX: 2, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g23qc4.png', ImageName: 'g23qc4.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x2) Square", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/graphics/g32qc4.png', ImageName: 'g32qc4.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(2x4) Square", sizeX: 2, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g24qc4a.png', ImageName: 'g24qc4a.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x2) Square", sizeX: 4, sizeY: 2, ImageUri: 'Images/tableImages/graphics/g42qc4a.png', ImageName: 'g42qc4a.png', Capacity: 4, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x3) Round", sizeX: 3, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g33rc6a.png', ImageName: 'g33rc6a.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g34qc6d.png', ImageName: 'g34qc6d.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g43qc6d.png', ImageName: 'g43qc6d.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g34qc6a.png', ImageName: 'g34qc6a.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g43qc6a.png', ImageName: 'g43qc6a.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g34qc6b.png', ImageName: 'g34qc6b.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g43qc6b.png', ImageName: 'g43qc6b.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g34qc6c.png', ImageName: 'g34qc6c.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g43qc6c.png', ImageName: 'g43qc6c.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g34qc6e.png', ImageName: 'g34qc6e.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g43qc6e.png', ImageName: 'g43qc6e.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g34qc6f.png', ImageName: 'g34qc6f.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g43qc6f.png', ImageName: 'g43qc6f.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x4) Round", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g34rc6a.png', ImageName: 'g34rc6a.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x3) Round", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g43rc6a.png', ImageName: 'g43rc6a.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x4) Round", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g34rc6b.png', ImageName: 'g34rc6b.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x3) Round", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g43rc6b.png', ImageName: 'g43rc6b.png', Capacity: 6, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x5) Square", sizeX: 3, sizeY: 5, ImageUri: 'Images/tableImages/graphics/g35qc8a.png', ImageName: 'g35qc8a.png', Capacity: 8, imgType: 'Graphics' });
            modelsArr.push({ name: "(5x3) Square", sizeX: 5, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g53qc8a.png', ImageName: 'g53qc8a.png', Capacity: 8, imgType: 'Graphics' });
            modelsArr.push({ name: "(3x5) Square", sizeX: 3, sizeY: 5, ImageUri: 'Images/tableImages/graphics/g35qc8b.png', ImageName: 'g35qc8b.png', Capacity: 8, imgType: 'Graphics' });
            modelsArr.push({ name: "(5x3) Square", sizeX: 5, sizeY: 3, ImageUri: 'Images/tableImages/graphics/g53qc8b.png', ImageName: 'g53qc8b.png', Capacity: 8, imgType: 'Graphics' });
            modelsArr.push({ name: "(5x5) Round", sizeX: 5, sizeY: 5, ImageUri: 'Images/tableImages/graphics/g55rc8a.png', ImageName: 'g55rc8a.png', Capacity: 8, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x6) Square", sizeX: 4, sizeY: 6, ImageUri: 'Images/tableImages/graphics/g46qc12.png', ImageName: 'g46qc12.png', Capacity: 12, imgType: 'Graphics' });
            modelsArr.push({ name: "(6x4) Round", sizeX: 6, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g64qc12.png', ImageName: 'g64qc12.png', Capacity: 12, imgType: 'Graphics' });
            modelsArr.push({ name: "(4x8) Square", sizeX: 4, sizeY: 8, ImageUri: 'Images/tableImages/graphics/g48qc12.png', ImageName: 'g48qc12.png', Capacity: 12, imgType: 'Graphics' });
            modelsArr.push({ name: "(8x4) Round", sizeX: 8, sizeY: 4, ImageUri: 'Images/tableImages/graphics/g84qc12.png', ImageName: 'g84qc12.png', Capacity: 12, imgType: 'Graphics' });

            //---- linear
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22qc2a.png', ImageName: 'l22qc2a.png', Capacity: 2, imgType: 'Linear' });
            modelsArr.push({ name: "(4x2) Round", sizeX: 4, sizeY: 2, ImageUri: 'Images/tableImages/linear/l42sc2.png', ImageName: 'l42sc2.png', Capacity: 2, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Round", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22rc2a.png', ImageName: 'l22rc2a.png', Capacity: 2, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22qc4.png', ImageName: 'l22qc4.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22qc4b.png', ImageName: 'l22qc4b.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22qc4c.png', ImageName: 'l22qc4c.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22qc4d.png', ImageName: 'l22qc4d.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22qc4e.png', ImageName: 'l22qc4e.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22qc4f.png', ImageName: 'l22qc4f.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22qc4g.png', ImageName: 'l22qc4g.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Square", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22qc4h.png', ImageName: 'l22qc4h.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Round", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22rc4a.png', ImageName: 'l22rc4a.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Round", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22rc4b.png', ImageName: 'l22rc4b.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Round", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22rc4c.png', ImageName: 'l22rc4c.png', Capacity: 4, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Round", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/l22rc4d.png', ImageName: 'l22rc4d.png', Capacity: 4, imgType: 'Linear' });

            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/linear/l34qc5.png', ImageName: 'l34qc5.png', Capacity: 5, imgType: 'Linear' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/linear/l43qc5.png', ImageName: 'l43qc5.png', Capacity: 5, imgType: 'Linear' });

            modelsArr.push({ name: "(2x3) Square", sizeX: 2, sizeY: 3, ImageUri: 'Images/tableImages/linear/l23qc6a.png', ImageName: 'l23qc6a.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(3x2) Square", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/linear/l32qc6a.png', ImageName: 'l32qc6a.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(3x3) Round", sizeX: 3, sizeY: 3, ImageUri: 'Images/tableImages/linear/l33rc6a.png', ImageName: 'l33rc6a.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(3x3) Round", sizeX: 3, sizeY: 3, ImageUri: 'Images/tableImages/linear/l33rc6b.png', ImageName: 'l33rc6b.png', Capacity: 6, imgType: 'Linear' });

            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/linear/l34qc6.png', ImageName: 'l34qc6.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/linear/l43qc6.png', ImageName: 'l43qc6.png', Capacity: 6, imgType: 'Linear' });

            modelsArr.push({ name: "(3x5) Round", sizeX: 3, sizeY: 5, ImageUri: 'Images/tableImages/linear/l35rc6.png', ImageName: 'l35rc6.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(5x3) Round", sizeX: 5, sizeY: 3, ImageUri: 'Images/tableImages/linear/l53rc6.png', ImageName: 'l53rc6.png', Capacity: 6, imgType: 'Linear' });

            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/linear/l34qc6a.png', ImageName: 'l34qc6a.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/linear/l43qc6a.png', ImageName: 'l43qc6a.png', Capacity: 6, imgType: 'Linear' });

            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/linear/l34qc6b.png', ImageName: 'l34qc6b.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/linear/l43qc6b.png', ImageName: 'l43qc6b.png', Capacity: 6, imgType: 'Linear' });

            modelsArr.push({ name: "(3x4) Square", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/linear/l34qc6c.png', ImageName: 'l34qc6c.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(4x3) Square", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/linear/l43qc6c.png', ImageName: 'l43qc6c.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(5x5) Round", sizeX: 5, sizeY: 5, ImageUri: 'Images/tableImages/linear/l55rc8a.png', ImageName: 'l55rc8a.png', Capacity: 6, imgType: 'Linear' });
            modelsArr.push({ name: "(5x5) Round", sizeX: 5, sizeY: 5, ImageUri: 'Images/tableImages/linear/l55rc8b.png', ImageName: 'l55rc8b.png', Capacity: 6, imgType: 'Linear' });

            modelsArr.push({ name: "(3x5) Square", sizeX: 3, sizeY: 5, ImageUri: 'Images/tableImages/linear/l35qc8.png', ImageName: 'l35qc8.png', Capacity: 8, imgType: 'Linear' });
            modelsArr.push({ name: "(3x5) Square", sizeX: 5, sizeY: 3, ImageUri: 'Images/tableImages/linear/l53qc8.png', ImageName: 'l53qc8.png', Capacity: 8, imgType: 'Linear' });
            modelsArr.push({ name: "(3x5) Round", sizeX: 3, sizeY: 5, ImageUri: 'Images/tableImages/linear/l35rc8.png', ImageName: 'l35rc8.png', Capacity: 8, imgType: 'Linear' });
            modelsArr.push({ name: "(5x3) Round", sizeX: 5, sizeY: 3, ImageUri: 'Images/tableImages/linear/l53rc8.png', ImageName: 'l53rc8.png', Capacity: 8, imgType: 'Linear' });
            modelsArr.push({ name: "(6x6) Round", sizeX: 6, sizeY: 6, ImageUri: 'Images/tableImages/linear/l66rc10.png', ImageName: 'l66rc10.png', Capacity: 10, imgType: 'Linear' });
            //modelsArr.push({ name: "(8x5) Square", sizeX: 8, sizeY: 5, ImageUri: 'Images/tableImages/linear/l85sc20.png', ImageName: 'l85sc20.png', Capacity: 20, imgType: 'Linear' });
            modelsArr.push({ name: "(2x2) Round", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/linear/sl22c2umbrella.png', ImageName: 'sl22c2umbrella.png', Capacity: 2, imgType: 'Linear' });
            //---------- Special
            modelsArr.push({ name: "Billiards", sizeX: 2, sizeY: 4, ImageUri: 'Images/tableImages/special/billiards_v.png', ImageName: 'billiards_v.png', Capacity: 4, imgType: 'Special' });
            modelsArr.push({ name: "Billiards", sizeX: 4, sizeY: 2, ImageUri: 'Images/tableImages/special/billiards.png', ImageName: 'billiards.png', Capacity: 4, imgType: 'Special' });

            modelsArr.push({ name: "Hall Orange", sizeX: 5, sizeY: 5, ImageUri: 'Images/tableImages/special/hall55c7_v.png', ImageName: 'hall55c7_v.png', Capacity: 7, imgType: 'Special' });
            modelsArr.push({ name: "Hall Orange", sizeX: 5, sizeY: 5, ImageUri: 'Images/tableImages/special/hall55c7.png', ImageName: 'hall55c7.png', Capacity: 7, imgType: 'Special' });

            modelsArr.push({ name: "Hall Grey", sizeX: 4, sizeY: 5, ImageUri: 'Images/tableImages/special/hallgrey45c6_v.png', ImageName: 'hallgrey45c6_v.png', Capacity: 6, imgType: 'Special' });
            modelsArr.push({ name: "Hall Grey", sizeX: 5, sizeY: 4, ImageUri: 'Images/tableImages/special/hallgrey45c6.png', ImageName: 'hallgrey45c6.png', Capacity: 6, imgType: 'Special' });

            modelsArr.push({ name: "Hall Lounce", sizeX: 3, sizeY: 5, ImageUri: 'Images/tableImages/special/s53sc6_v.png', ImageName: 's53sc6_v.png', Capacity: 6, imgType: 'Special' });
            modelsArr.push({ name: "Hall Lounce", sizeX: 5, sizeY: 3, ImageUri: 'Images/tableImages/special/s53sc6.png', ImageName: 's53sc6.png', Capacity: 6, imgType: 'Special' });
            
            modelsArr.push({ name: "Beach Chair", sizeX: 2, sizeY: 3, ImageUri: 'Images/tableImages/special/beachchair_v.png', ImageName: 'beachchair_v.png', Capacity: 1, imgType: 'Special' });
            modelsArr.push({ name: "Beach Chair", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/special/beachchair.png', ImageName: 'beachchair.png', Capacity: 1, imgType: 'Special' });

            modelsArr.push({ name: "Umbrella R", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/special/s22sc2a.png', ImageName: 's22sc2a.png', Capacity: 2, imgType: 'Special' });
            modelsArr.push({ name: "Umbrella SQ", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/special/s22sc2b.png', ImageName: 's22sc2b.png', Capacity: 2, imgType: 'Special' });
            modelsArr.push({ name: "Umbrella Color", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/special/s22sc2c.png', ImageName: 's22sc2c.png', Capacity: 2, imgType: 'Special' });

            modelsArr.push({ name: "Sofa Grey s3", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/special/s32sc3.png', ImageName: 's32sc3.png', Capacity: 3, imgType: 'Special' });

            modelsArr.push({ name: "Sofa Grey s6", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/special/s33sc6.png', ImageName: 's33sc6.png', Capacity: 6, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s6", sizeX: 2, sizeY: 3, ImageUri: 'Images/tableImages/special/s33sc6d90.png', ImageName: 's33sc6d90.png', Capacity: 6, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s6", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/special/s33sc6d180.png', ImageName: 's33sc6d180.png', Capacity: 6, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s6", sizeX: 2, sizeY: 3, ImageUri: 'Images/tableImages/special/s33sc6d270.png', ImageName: 's33sc6d270.png', Capacity: 6, imgType: 'Special' });

            modelsArr.push({ name: "Sofa Grey s7", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/special/s43sc7.png', ImageName: 's43sc7.png', Capacity: 7, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s7", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/special/s43sc7d90.png', ImageName: 's43sc7d90.png', Capacity: 7, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s7", sizeX: 4, sizeY: 3, ImageUri: 'Images/tableImages/special/s43sc7d180.png', ImageName: 's43sc7d180.png', Capacity: 7, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s7", sizeX: 3, sizeY: 4, ImageUri: 'Images/tableImages/special/s43sc7d270.png', ImageName: 's43sc7d270.png', Capacity: 7, imgType: 'Special' });

            modelsArr.push({ name: "Sofa Grey s8", sizeX: 5, sizeY: 3, ImageUri: 'Images/tableImages/special/s53sc8.png', ImageName: 's53sc8.png', Capacity: 8, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s8", sizeX: 3, sizeY: 5, ImageUri: 'Images/tableImages/special/s53sc8d90.png', ImageName: 's53sc8d90.png', Capacity: 8, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s8", sizeX: 5, sizeY: 3, ImageUri: 'Images/tableImages/special/s53sc8d180.png', ImageName: 's53sc8d180.png', Capacity: 8, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s8", sizeX: 3, sizeY: 5, ImageUri: 'Images/tableImages/special/s53sc8d270.png', ImageName: 's53sc8d270.png', Capacity: 8, imgType: 'Special' });

            modelsArr.push({ name: "Sofa Grey s2", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/special/sofagrey22c2.png', ImageName: 'sofagrey22c2.png', Capacity: 2, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s2", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/special/sofagrey22c2d90.png', ImageName: 'sofagrey22c2d90.png', Capacity: 2, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s2", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/special/sofagrey22c2d180.png', ImageName: 'sofagrey22c2d180.png', Capacity: 2, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s2", sizeX: 2, sizeY: 2, ImageUri: 'Images/tableImages/special/sofagrey22c2d270.png', ImageName: 'sofagrey22c2d270.png', Capacity: 2, imgType: 'Special' });

            modelsArr.push({ name: "Sofa Grey s3b", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/special/sofagrey32c3.png', ImageName: 'sofagrey32c3.png', Capacity: 3, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s3b", sizeX: 2, sizeY: 3, ImageUri: 'Images/tableImages/special/sofagrey32c3d90.png', ImageName: 'sofagrey32c3d90.png', Capacity: 3, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s3b", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/special/sofagrey32c3d180.png', ImageName: 'sofagrey32c3d180.png', Capacity: 3, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Grey s3b", sizeX: 2, sizeY: 3, ImageUri: 'Images/tableImages/special/sofagrey32c3d270.png', ImageName: 'sofagrey32c3d270.png', Capacity: 3, imgType: 'Special' });

            modelsArr.push({ name: "Sofa Orange s3", sizeX: 2, sizeY: 3, ImageUri: 'Images/tableImages/special/sofaorangec3.png', ImageName: 'sofaorangec3.png', Capacity: 3, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Orange s3b", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/special/sofaorangehor32c3.png', ImageName: 'sofaorangehor32c3.png', Capacity: 3, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Orange s3", sizeX: 2, sizeY: 3, ImageUri: 'Images/tableImages/special/sofaorangec3d180.png', ImageName: 'sofaorangec3d180.png', Capacity: 3, imgType: 'Special' });
            modelsArr.push({ name: "Sofa Orange s3b", sizeX: 3, sizeY: 2, ImageUri: 'Images/tableImages/special/sofaorangehor32c3d180.png', ImageName: 'sofaorangehor32c3d180.png', Capacity: 3, imgType: 'Special' });

             
            return modelsArr;
        };
        retFactory.defaultTableModel = {
            Id: 0,
            Code: null,
            SalesDescription: null,
            Description: null,
            MinCapacity: 1,
            MaxCapacity: null,
            RegionId: null,
            Status: 1,
            IsOnline: 0,
            ReservationStatus: null,
            Shape: 0,
            TurnoverTime: null,
            Width: null,
            Height: null,
            XPos: null,
            YPos: null,
            ImageUri: null,
            Angle: null,
            IsDeleted: false
        };
        retFactory.defaultWidgetModel = {
            Id: 0,
            name: '',
            Code: '',

            sizeX: 2,
            sizeY: 2,
            row: 0,
            col: 0,
            Shape: 0,
            ImageUri: '',
            Angle: 0,
            Capacity: 1
        };
        //Create widget from Table properties
        //if ignore size == true will map the array 
        retFactory.createwidgetTables = function (tableArr, ignoreSize, gridsterOpts, containerDisplaySize) {
            var retArr = [];
            if (tableArr !== undefined && tableArr !== null)
                retArr = tableArr.map(function (item) {
                    item.Angle = (item.Angle !== undefined && item.Angle !== null && item.Angle !== '') ? Number(item.Angle) : 0;
                    if (item.ImageUri === undefined || item.ImageUri === null || item.ImageUri == '')
                        item.ImageUri = null;
                    var tmpWid = {
                        Id: item.Id,
                        name: item.Description,
                        Code: item.Code,
                        ImageUri: (item.ImageUri === undefined || item.ImageUri === null || item.ImageUri == '') ? null : item.ImageUri,
                        Angle: item.Angle,
                        Shape : item.Shape,
                        Capacity: item.MaxCapacity,

                    }
                    if (ignoreSize != true) {
                        var sizes = predictSizeFun(item, gridsterOpts, containerDisplaySize);
                        tmpWid.sizeX = sizes.sizeX;
                        tmpWid.sizeY = sizes.sizeY;
                        tmpWid.row = sizes.row;
                        tmpWid.col = sizes.col;
                    } else {
                        tmpWid.sizeX = null;
                        tmpWid.sizeY = null;
                        tmpWid.row = null;
                        tmpWid.col = null;
                    }
                    tmpWid.loadingImage = false;
                    if (typeof item.Shape !== 'boolean') {
                        if(item.Shape ==  0 )
                            tmpWid.Shape = false 
                        if (item.Shape == 1)
                            tmpWid.Shape = true;
                    }
                    item.widget = tmpWid;
                    return item;
                })
            return retArr;
        };
        retFactory.createTableFromWidget = function (widget) {
            var nwTable = angular.copy(retFactory.defaultTableModel);
            nwTable.widget = widget;
            nwTable.widget.Id = 0;
            nwTable.widget.Shape = 0;
            if (typeof widget.Shape === 'boolean') {
                (widget.Shape == false) ? nwTable.Shape = 0 : nwTable.Shape = 1;
            }
            nwTable.Description = widget.name;
            nwTable.SalesDescription = widget.name;
            nwTable.Code = widget.Code;
            nwTable.MaxCapacity = widget.Capacity;
            nwTable.Angle = (widget.Angle !== undefined && widget.Angle !== null && widget.Angle !== '') ? Number(widget.Angle) : 0;
            nwTable.ImageUri = (widget.ImageUri === undefined || widget.ImageUri === null || widget.ImageUri == '') ? nwTable.ImageUri = null : widget.ImageUri
           
            //newTable.
            return nwTable;
        };
        retFactory.algorithm = {
            //input: Table as Item  , gridsterOpts :{ colWidth : ..  rowHeight: ..} , containerDisplaySize :{ width: .. , height : ..}
            //takes table analog size and x,y pos and  created a widget size return digitaled view to fit on gridster
            predictSize: predictSizeFun,
            //Input Array of tables and
            manageTablesToSave: function (tarr, gridsterOpts, containerDisplaySize) {
                var ret = [];
                angular.forEach(tarr, function (ct) {
                    //console.log("x:" + ct.XPos + " y:" + ct.YPos);
                    var obj = {
                        Id: ct.Id,
                        Code: ct.Code,
                        SalesDescription: ct.Code,
                        Description: ct.Code,
                        //SalesDescription: ct.SalesDescription,
                        //Description: ct.Description,
                        MinCapacity: ct.MinCapacity,
                        MaxCapacity: ct.MaxCapacity,
                        RegionId: ct.RegionId,
                        Status: ct.Status,
                        IsOnline: ct.IsOnline,
                        ReservationStatus: ct.ReservationStatus,
                        Shape: ct.Shape,
                        TurnoverTime: ct.TurnoverTime,


                        Width: ct.widget.sizeX * gridsterOpts.colWidth,
                        Height: ct.widget.sizeY * gridsterOpts.rowHeight,
                        XPos: ((ct.widget.col * gridsterOpts.colWidth) / containerDisplaySize.width) * 100,
                        YPos: ((ct.widget.row * gridsterOpts.rowHeight) / containerDisplaySize.height) * 100,
                        ImageUri: (ct.widget.ImageUri === null || ct.widget.ImageUri === undefined || ct.widget.ImageUri == '') ? null : ct.widget.ImageUri,
                          //  : ((ct.widget.ImageUri.indexOf(Imageprefix) > -1) ? ct.widget.ImageUri : Imageprefix + ct.widget.ImageName),
                        Angle: ct.widget.Angle,
                        IsDeleted: (ct.IsDeleted != true) ? false : true,
                    }
                    if( typeof obj.Shape === 'boolean')
                        (obj.Shape == false) ? obj.Shape = 0 : obj.Shape =1 ;
                    ret.push(obj);
                    //console.log("Ex:" + ct.XPos + " Ey:" + ct.YPos);
                })
                return ret;
            }
        };
        return retFactory;


    }])
function predictSizeFun(item, gridsterOpts, containerDisplaySize) {
    var ret = { sizeX: null, sizeY: null, row: null, col: null };
    //Total Old tables have 50px width so default size of 2x2 will give 50px width
    var sx = (item.Width === null || item.Width === undefined || item.Width == 0) ? 2 : (item.Width / (gridsterOpts.colWidth)).toFixed(0);
    var sy = (item.Height === null || item.Height === undefined) ? 2 : (item.Height / (gridsterOpts.rowHeight)).toFixed(0);

    var rw = (item.YPos === undefined || item.YPos === null) ? -1 : (((item.YPos / 100) * containerDisplaySize.height) / (gridsterOpts.rowHeight)).toFixed(0); //85vh pos
    var cl = (item.XPos === undefined || item.XPos === null) ? -1 : (((item.XPos / 100) * containerDisplaySize.width) / (gridsterOpts.colWidth)).toFixed(0); //col-md-8 width
    ret.sizeX = Number(sx); ret.sizeY = Number(sy);
    ret.row = Number(rw); ret.col = Number(cl);
    return ret;
}
