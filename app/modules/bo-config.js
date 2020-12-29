(function () {
angular.module('posBOApp')
    .config(function ($mdThemingProvider) {
        //http://www.google.com/design/spec/style/color.html#
        //apply to 
        //md-button     md-checkbox    md-progress-circular    md-progress-linear    md-radio-button    md-slider    md-switch    md-tabs   md-input-container    md-toolbar
        //theme.primaryPalette, theme.accentPalette, theme.warnPalette, theme.backgroundPalette).
        //red //pink //purple //deep - purple //indigo //blue //light - blue //cyan //teal //green //light - green //lime //yellow //amber //orange //deep - orange //brown //grey //blue - grey

        //$mdThemingProvider.theme('default').primaryPalette('grey', { 'default': '700' }).accentPalette('blue', { 'default': '500' }).warnPalette('amber');
        //$mdThemingProvider.theme('menu-theme').primaryPalette('grey', { 'default': '700' }).accentPalette('blue', { 'default': '500' }).warnPalette('amber');
        $mdThemingProvider.theme('default').primaryPalette('indigo').accentPalette('pink').warnPalette('orange');
        $mdThemingProvider.theme('menu-theme').primaryPalette('grey', { 'default': '900' }).accentPalette('indigo', { 'default': '700' }).warnPalette('orange');
        $mdThemingProvider.theme('msg-theme').primaryPalette('grey', { 'default': '900' }).accentPalette('indigo', { 'default': '700' }).warnPalette('orange');

        $mdThemingProvider.theme('buttonIndicator').primaryPalette('green', { 'default': '600' }).accentPalette('blue', { 'default': '500' }).warnPalette('red', { 'default': '600' });
        $mdThemingProvider.theme('invert-default').primaryPalette('green', { 'default': '50' }).backgroundPalette('indigo', { 'default': '500' }).dark();
        $mdThemingProvider.theme('action-palette').primaryPalette('blue').accentPalette('amber').warnPalette('red');//.backgroundPalette('grey', { 'default': '900' }).dark();
        $mdThemingProvider.theme('dark-palette').primaryPalette('grey', { 'default': '50' }).backgroundPalette('grey', { 'default': '900' }).dark();

    }).config(function ($mdDateLocaleProvider) {
        //http://www.w3schools.com/angular/ng_filter_date.asp
        $mdDateLocaleProvider.formatDate = function (date) {
            return moment(date).format('DD-MMM-YYYY');//'YYYY-MM-DD');
        };

        //"short" same as "M/d/yy h:mm a" (1/5/16 9:05 AM)
        //"medium" same as "MMM d, y h:mm:ss a" (Jan 5, 2016 9:05:05 AM)
        //"shortDate" same as "M/d/yy" (1/5/16)
        //"mediumDate" same as "MMM d, y" (Jan 5, 2016)
        //"longDate" same as "MMMM d, y" (January 5, 2016)
        //"fullDate" same as "EEEE, MMMM d, y" (Tuesday, January 5, 2016)
        //"shortTime" same as "h:mm a" (9:05 AM)
        //"mediumTime" same as "h:mm:ss a" (9:05:05 AM)
    }).config(function ($mdIconProvider) {
        $mdIconProvider.iconSet("action", "/Content/angular-material-icons/action.svg")
            .iconSet("alert", "/Content/angular-material-icons/alert.svg")
            .iconSet("av", "/Content/angular-material-icons/av.svg")
            .iconSet("communication", "/Content/angular-material-icons/communication.svg")
            .iconSet("content", "/Content/angular-material-icons/content.svg")
            .iconSet("device", "/Content/angular-material-icons/device.svg")
            .iconSet("editor", "/Content/angular-material-icons/editor.svg")
            .iconSet("file", "/Content/angular-material-icons/file.svg")
            .iconSet("hardware", "/Content/angular-material-icons/hardware.svg")
            .iconSet("image", "/Content/angular-material-icons/image.svg")
            .iconSet("maps", "/Content/angular-material-icons/maps.svg")
            .iconSet("navigation", "/Content/angular-material-icons/navigation.svg")
            .iconSet("notification", "/Content/angular-material-icons/notification.svg")
            .iconSet("soclal", "/Content/angular-material-icons/soclal.svg")
            .iconSet("toggle", "/Content/angular-material-icons/toggle.svg")
        .defaultIconSet('Content/angular-material-icons/action.svg');
    })
}());