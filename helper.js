var utils = require('lodash');

module.exports = {
   getPullReqIds: function(data){
       var pullReqIdList  = [];
       utils.forEach(data, function(pullReq){
            pullReqIdList.push(pullReq.id);
       });
       return pullReqIdList;
   },
   filterActivities: function(data){
       var activitiesFiltered  = [];
       utils.forEach(data, function(activity){
           if(activity.action === 'COMMENTED')
                activitiesFiltered.push(activity);
       });
       return activitiesFiltered;
   }
};