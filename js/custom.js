(function(){
"use strict";
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var app = angular.module('viewCustom', ['angularLoad']);

app.run(['$state', '$rootScope', '$location', function ($state, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $state.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $state.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);

var LocationItemsAfterController = function LocationItemsAfterController($compile, $scope) {
    _classCallCheck(this, LocationItemsAfterController);

    this.$scope = $scope;

    angular.element(document.getElementsByTagName('prm-location-items')[0].children[1]).after($compile('<prm-location-items-before parent-ctrl="$ctrl.parentCtrl"></prm-location-items-before>')($scope));
};

LocationItemsAfterController.$inject = ['$compile', '$scope'];

app.component('prmLocationItemsAfter', {
    bindings: { parentCtrl: '<' },
    controller: LocationItemsAfterController,
    template: ''
});

var LocationItemsBeforeController = function () {
    function LocationItemsBeforeController($scope, $timeout, $sce, $mdDialog, $mdPanel, $location, $state, $rootScope, $window) {
        _classCallCheck(this, LocationItemsBeforeController);

        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$sce = $sce;
        this.$mdDialog = $mdDialog;
        this.$mdPanel = $mdPanel;
        this.$location = $location;
        this.$state = $state;
        this.$rootScope = $rootScope;
        this.$window = $window;
    }

    _createClass(LocationItemsBeforeController, [{
        key: '$postLink',
        value: function $postLink() {
            var _this = this;

            this.$scope.$watch(function () {
                return _this.parentCtrl.currLoc && _this.parentCtrl.currLoc.locationNoItems;
            }, function () {
                if (_this.shouldShowLink()) {
                    _this.$timeout(function () {
                        return _this.hideLoginAlert();
                    });
                }
            });
        }
    }, {
        key: 'hideLoginAlert',
        value: function hideLoginAlert() {

            var all_spans = angular.element(document.getElementsByTagName('prm-location-items')[0]).find('span');
            var inter_spans = Array.prototype.slice.call(all_spans).filter(function (e) {
                return e.getAttribute('translate') === 'nui.locations.noitems.guest' || e.getAttribute('translate') === 'nui.locations.noitems.signin';
            });
            if (inter_spans.length) {
                inter_spans[0].parentNode.style.display = "none";
            }
        }
    }, {
        key: 'shouldShowLink',
        value: function shouldShowLink() {
            var item = this.parentCtrl.item;
            var delCategory = item.delivery.deliveryCategory && item.delivery.deliveryCategory[0];
            var isPhysicalItem = delCategory === 'Physical Item' || delCategory === '$$VPhysical Item';
            return this.parentCtrl.currLoc && item.pnx.display.type[0] === 'journal' && isPhysicalItem;
        }
    }, {
        key: 'shouldShowWidgetLink',
        value: function shouldShowWidgetLink() {
            var item = this.parentCtrl.item;
            var delCategory = item.delivery.deliveryCategory && item.delivery.deliveryCategory[0];
            var isPhysicalItem = delCategory === 'Physical Item' || delCategory === '$$VPhysical Item';
            return this.parentCtrl.currLoc && isPhysicalItem /*&& (this.parentCtrl.userSessionManagerService.getUserName() &&
                                                             this.parentCtrl.userSessionManagerService.getUserName().length > 0)*/;
        }
    }, {
        key: 'getLink',
        value: function getLink() {

            var links = this.parentCtrl.item.delivery.link;
            var ilsApiID = this.parentCtrl.currLoc.location.ilsApiId;
            var selectedLink = '';
            links.forEach(function (e) {
                if (e.linkType === 'http://purl.org/pnx/linkType/backlink') {
                    if (e.linkURL.indexOf(ilsApiID) > -1) {
                        selectedLink = e.linkURL;
                    }
                }
            });

            return selectedLink;
        }
    }, {
        key: 'openWidget',
        value: function openWidget(link, event) {
            var _this2 = this;

            /*var parentEl = angular.element(document.body);*/
            var panelRef;

            var widgetUrl = link.$$unwrapTrustedValue();

            this.$state.current.reloadOnSearch = false; //set the reloadOnSearch to false so that state isn't reloaded

            /*listen for locationChangeSuccess and change reloadOnSearch back to true so that we once again
             support back and forward buttons in browser */
            var currentState = this.$state.current;
            var $rootScope = this.$rootScope;
            var listener = this.$rootScope.$on('$locationChangeSuccess', function () {
                currentState.reloadOnSearch = true;
                listener();
                var listener2 = $rootScope.$on('$stateChangeStart', function (e) {
                    e.preventDefault();
                    listener2();
                });
            });

            var userAgent = this.$window.navigator.userAgent;
            var isFirefox = /firefox/i.test(userAgent);
            if (isFirefox) {
                window.location = window.location + '&widgetUrl=' + encodeURIComponent(widgetUrl);
            } else {
                this.$location.search('widgetUrl', widgetUrl);
                if (currentState.name === 'fulldisplay') {
                    var parentEl = angular.element(document.body);
                    var templateString = '<md-dialog style="width:100%;padding:2em;max-width:500px;" aria-label="List dialog">\n                                    <md-dialog-content >\n                                        <div>\n                                        <p>Due to a system upgrade, this service has been disabled.</p>\n                                        </div>\n                                    </md-dialog-content>\n                                        <md-dialog-actions>\n                                            <div flex layout="row" layout-align="center center">\n                                                <md-button ng-click="closeDialog()" class="md-primary">\n                                                    {{"nui.locations.items.widget.close" | translate}}\n                                                </md-button>\n                                            </div>\n                                        </md-dialog-actions>\n                                   </md-dialog>';

                    var dialogObj = {
                        parent: parentEl,
                        /**/
                        template: templateString,

                        controller: function controller($scope, $mdDialog) {

                            $scope.closeDialog = function () {
                                $mdDialog.hide().then(function () {
                                    var mask = angular.element(document.getElementsByClassName('md-scroll-mask'));
                                    if (mask && mask.length > 0) {
                                        angular.element(document.getElementsByClassName('md-scroll-mask'))[0].remove();
                                    }
                                });
                            };
                        }
                    };
                    var mdDialog = this.$mdDialog;

                    this.$timeout(function () {
                        mdDialog.show(dialogObj).then(function () {
                            _this2.$location.search('widgetUrl', null);
                        });
                    });
                }
            }
        }
    }, {
        key: 'getWidgetLink',
        value: function getWidgetLink() {
            var item = this.parentCtrl.item;
            var availlibraries = item.pnx.display.availlibrary;
            var selectedLink = [];
            var selectedLink = '';
            var dbid = '';
            var lib = '';
            var cNumber = '';

            var ilsApiID = this.parentCtrl.currLoc.location.ilsApiId;
            var callNumber = this.parentCtrl.currLoc.location.callNumber;
            var library = this.parentCtrl.currLoc.location.libraryCode;
            availlibraries.forEach(function (e) {

                var arr = e.split('$$');
                dbidTemp = '';
                lib = '';
                cNumber = '';
                for (var i = 0; i < arr.length; i++) {
                    var param = arr[i];
                    switch (param[0]) {
                        case '2':
                            cNumber = param.substring(1);
                            break;
                        case 'X':
                            var dbidTemp = param.substring(1);
                            break;
                        case 'L':
                            lib = param.substring(1);
                            break;

                    }
                }
                if (lib === library && callNumber === cNumber) {
                    dbid = dbidTemp;
                }
            });
            if (ilsApiID && dbid) {
                selectedLink = this.$sce.trustAsResourceUrl('http://www.lib.cam.ac.uk/request_pages/request_login.cgi?bib_id=' + ilsApiID + '&bib_database=' + dbid);
            } else {
                selectedLink = '';
            }

            return selectedLink;
        }
    }]);

    return LocationItemsBeforeController;
}();

LocationItemsBeforeController.$inject = ['$scope', '$timeout', '$sce', '$mdDialog', '$mdPanel', '$location', '$state', '$rootScope', '$window'];

function PanelDialogCtrl(mdPanelRef) {
    this._mdPanelRef = mdPanelRef;
}

PanelDialogCtrl.prototype.closePanel = function () {
    var panelRef = this._mdPanelRef;

    panelRef && panelRef.close().then(function () {
        angular.element(document.querySelector('.demo-dialog-open-button')).focus();
        panelRef.destroy();
    });
};

app.component('prmLocationItemsBefore', {
    bindings: { parentCtrl: '<' },
    controller: LocationItemsBeforeController,
    template: '<div class="loc-link-summary-holdings" ng-if="$ctrl.shouldShowLink()">\n        <div external-link>\n            <a class="arrow-link md-primoExplore-theme"  href="{{$ctrl.getLink()}}" target="_blank">\n                <span translate="nui.locations.noitems.holdingsLink">\n                </span>\n                <md-icon aria-label="icon-open-in-new" class="md-primoExplore-theme" aria-hidden="true">\n                    <svg width="100%" height="100%" viewBox="0 0 24 24" y="504" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">\n                        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z">\n                        </path>\n                    </svg>\n                </md-icon>\n                <md-icon aria-label="icon-chevron-right" class="md-primoExplore-theme" aria-hidden="true">\n                    <svg width="100%" height="100%" viewBox="0 0 24 24" y="384" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">\n                        <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z">\n                        </path>   \n                    </svg>\n                </md-icon>\n            </a>\n        </div>\n    </div>\n    <div class="loc-link-summary-holdings" ng-if="$ctrl.shouldShowWidgetLink()">\n        <div external-link>\n            <a class="animation-target arrow-link md-primoExplore-theme"  ng-click="$ctrl.openWidget($ctrl.getWidgetLink(),$event)" target="_blank"> \n                <span translate="nui.locations.items.widget.link"> \n                </span> \n                <md-icon aria-label="icon-open-in-new" class="md-primoExplore-theme" aria-hidden="true">   \n                    <svg width="100%" height="100%" viewBox="0 0 24 24" y="504" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">\n                        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z">\n                        </path>\n                    </svg>\n                </md-icon>\n                <md-icon aria-label="icon-chevron-right" class="md-primoExplore-theme" aria-hidden="true">\n                    <svg width="100%" height="100%" viewBox="0 0 24 24" y="384" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">\n                        <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>\n                     </svg>\n                </md-icon>\n            </a>\n    </div>\n</div>'
});
})();