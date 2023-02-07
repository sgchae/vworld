
$(function (e) {
    "use strict";
    /**
 * ztree 초기화 및 이벤트 설정
 * https://treejs.cn/
 */
var setting = {
    check: {
      enable: true,
    },
    data: {
      simpleData: {
        enable: true
      }
    },
    edit: {
      enable: false,
      showRemoveBtn: false,
      showRenameBtn: false
    },
    callback: {
      onCheck: myOnCheck, 
      onRemove: myUnCheck
    },
    view: {
      showIcon: false,
      dblClickExpand: false,
      addHoverDom: addHoverDom,
      removeHoverDom: removeHoverDom,
      showLine: true
    }
  };

  
  var treeArray = [
    {"id": 10, "pId": 0, "name": "미구현", "isParent": true, "closed": true, "nocheck": true},
    {"id": 11, "pId": 10, "name": "광역시도"},
    {"id": 12, "pId": 10, "name": "시군구"},
    {"id": 13, "pId": 10, "name": "읍면동"},
    {"id": 13, "pId": 10, "name": "리"},

    {"id": 20, "pId": 0, "name": "미구현", "isParent": true, "closed": true, "nocheck": true},
    {"id": "vworld_bonbun", "pId": 20, "name": "연속지적도"},
    {"id": "lx_base", "pId": 20, "name": "LX기본도"},

    {"id": 30, "pId": 0, "name": "미구현", "isParent": true, "closed": true, "nocheck": true},
    {"id": "fac_39", "pId": 30, "name": "3차원건물", checked : false},
    {"id": "fac_40", "pId": 30, "name": "POI", checked : false},

    {"id": 40, "pId": 0, "name": "해외출입국", "isParent": true, "open": true, "nocheck": true},
    {"id": "immigrant_01", "pId": 40, "name": "1번입국자"},
    {"id": "immigrant_02", "pId": 40, "name": "2번입국자"},
    {"id": "immigrant_03", "pId": 40, "name": "3번입국자"},
    {"id": "immigrant_04", "pId": 40, "name": "4번입국자"},

  ];
  $.fn.zTree.init($("#tree1"), setting, treeArray);

//   $('#tree1').on("click",function(e){
//         console.log(e);
//   })


  var addHoverDom = function (treeId, treeNode) {
  if (treeNode.level < 1)
    return;

  if (treeNode.getParentNode().name != "주제도")
    return;

  if ($("#diyBtn_" + treeNode.id).length > 0)
    return;

  var btnId = "diyBtn_" + treeNode.id;
  var editStr = "<button type='button' class='nodeCustomDelBtn' id='" + btnId + "' title='" + treeNode.name + "' ></button>";
  $("#" + treeNode.tId + "_a").append(editStr);

  var btnEle = document.getElementById(btnId);
  btnEle.addEventListener("click", event => onRemove(treeId, treeNode));
}

var removeHoverDom = function (treeId, treeNode) {
  if (treeNode.level < 1)
    return;

  if (treeNode.getParentNode().name != "주제도")
    return;

  if ($("#diyBtn_" + treeNode.id).length <= 0)
    return;

  $("#diyBtn_" + treeNode.id).unbind().remove();
}

var myUnCheck = function (treeId, treeNode) {
  var zTree = $.fn.zTree.getZTreeObj("tree1");
  let tid = treeNode.id;
  let tname = treeNode.name;
  

}

function myOnCheck(event, treeId, treeNode) {
    //alert(treeNode.tId + ", " + treeNode.name + "," + treeNode.checked);
    let tid = treeNode.id;
    let tname = treeNode.name;

    if(treeNode.checked){ //체크 true
        if(tid.indexOf('immigrant_')>-1){
            let imNumber = treeNode.id.substring(11,12);
            console.log(`${imNumber}동 검색 구현`);
            cluster(`${imNumber}동`,tid);
        }

    }else{//체크 false
        if(tid.indexOf('immigrant_')>-1){
            map.getLayers().forEach(function(layer){
                if(layer==null){return;}
                if(layer.get("name")==tid){
                    map.removeLayer(layer);
                }
            });
       }

    }

    
};

})