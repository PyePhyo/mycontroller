/*
 * Copyright 2015-2016 Jeeva Kandasamy (jkandasa@gmail.com)
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

angular.module('adf.widget.myc-custom-widget', [])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('mycCustomWidget', {
        title: 'Custom widget',
        description: 'Make your own widget with script and template',
        templateUrl: 'controllers/adf-widgets/adf-myc-cw/view.html',
        controller: 'mycCustomWidgetController',
        controllerAs: 'mycCustomWidget',
        config: {
          script: null,
          template: null,
          refreshTime:30,
        },
        edit: {
          templateUrl: 'controllers/adf-widgets/adf-myc-cw/edit.html',
          controller: 'mycCustomWidgetEditController',
          controllerAs: 'mycCustomWidgetEdit',
        }
      });
  })
  .controller('mycCustomWidgetController', function($scope, $interval, config, TemplatesFactory, $sce){
    var mycCustomWidget = this;
    mycCustomWidget.showLoading = true;
    mycCustomWidget.isSyncing = false;
    mycCustomWidget.htmlData = null;

    function updateState(){
      mycCustomWidget.dataAvailable = true;
      mycCustomWidget.isSyncing = false;
      if(mycCustomWidget.showLoading){
        mycCustomWidget.showLoading = false;
      }
    };

    function loadData(){
      mycCustomWidget.isSyncing = true;
      TemplatesFactory.getHtml({'script':config.script,"template":config.template}, function(response){
        mycCustomWidget.htmlData = response.message;
        updateState();
      },function(error){
        mycCustomWidget.htmlData = '<pre>'+error.data.errorMessage+'</pre>';
        updateState();
      });
    };

    function updateData(){
      if(mycCustomWidget.isSyncing){
        return;
      }else if(config.template !== null){
        loadData();
      }
    }

    //Trust as html
    mycCustomWidget.trustAsHtml = function(string) {
        return $sce.trustAsHtml(string);
    };

    //load variables initially
    if(config.dataKey !== null){
      updateData();
    }else{
      mycCustomWidget.showLoading = false;
    }

    // refresh every second
    var promise = $interval(updateData, config.refreshTime*1000);

    // cancel interval on scope destroy
    $scope.$on('$destroy', function(){
      $interval.cancel(promise);
    });

  }).controller('mycCustomWidgetEditController', function($scope, $interval, config, TypesFactory, ScriptsFactory, TemplatesFactory, CommonServices){
    var mycCustomWidgetEdit = this;
    mycCustomWidgetEdit.cs = CommonServices;

    // load variables at startup
    mycCustomWidgetEdit.scripts = ScriptsFactory.getAllLessInfo({"type":"Operation"});
    mycCustomWidgetEdit.templates = TemplatesFactory.getAllLessInfo();

  });
