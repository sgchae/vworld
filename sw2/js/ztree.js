var layerList =[]

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

  //ztree의 레이어 관리 샘플 예시 , 브이월드 json 기반으로 레이어 올리고 나머지는 하드 코딩?
  var treeArray = [
    // {"id": 10, "pId": 0, "name": "미구현", "isParent": true, "closed": true, "nocheck": true},
    // {"id": 11, "pId": 10, "name": "광역시도"},
    // {"id": 12, "pId": 10, "name": "시군구"},
    // {"id": 13, "pId": 10, "name": "읍면동"},
    // {"id": 13, "pId": 10, "name": "리"},
  ];
var DICTIONARY,GroupLIST,LIST;
  $.ajax({
		type : "get",
		url : 'json/layerTree3D.json' ,
		
		dataType : 'json',
		async : false,
		//jsonpCallback:"parseResponse",
		success : function(data) {
      GroupLIST = data.GroupLIST;
      LIST = data.LIST;
      DICTIONARY = data.DICTIONARY;
      
      data.GroupLIST.forEach(function(e){ //부모키 등록
        treeArray.push({"id":e.GRPIDE, "pId": 0, "name": e.GRPNAM, "isParent": true, "closed": true, "nocheck": true})

      })
      data.LIST.forEach(function(e){ // 자식들 
        treeArray.push({"id":e.LYRIDE, "pId": e.GRPIDE, "name": e.LAKNAM,  "closed": true, "LAENAM" : e.LAENAM, "WFSNAM":e.WFSNAM})
      })


		},
		error : function(xhr, stat, err) {
		}
  });
  $(".scrollbar-inner").scrollbar(); // 스크롤바 생성 
  $.fn.zTree.init($("#tree1"), setting, treeArray);
  $('#tree1_1').hide()
  $('#tree1_2').hide()
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
    console.log(treeNode.tId + ", " + treeNode.name + "," + treeNode.checked);
    let tid = treeNode.tId;
    let tname = treeNode.name;
    let LAENAM = treeNode.LAENAM;
    let loLAENAM = LAENAM.toLowerCase();
    let layerMeta = treeNode;
    let rangeHtml = "";

    if(treeNode.checked){ //체크 true
      $('#range-noti').show()

      //하드 코딩 3D 제어 
      if(treeNode.name=='3D건물'){

        tileset.show = true;
        return;
      }

      if(treeNode.name=='3DTiles'){
        etri_tileset = new Cesium.Cesium3DTileset({
          //여산휴게소  url: "http://129.254.221.88:9009/data/3dtiles/wgs84/%EC%97%AC%EC%82%B0%ED%9C%B4%EA%B2%8C%EC%86%8C_2021_b_d/test.json",
          //  url: "http://129.254.221.88:9009/data/3dtiles/wgs84/서울시/Zip/Seoul.json",
            url: "http://129.254.221.88:9009/data/3dtiles/wgs84/yeouido_2201_b_d/test.json",
          });
          etri_tileset.readyPromise
          .then(function (etri_tileset) {
            viewer.scene.primitives.add(etri_tileset);
            viewer.zoomTo(
              etri_tileset,
              new Cesium.HeadingPitchRange(
                0.0,
                -0.5,
                etri_tileset.boundingSphere.radius * 2.0
              )
            );
          });
        return;
      }

      addAdditionalLayerOption(
        LAENAM,
        new Cesium.WebMapServiceImageryProvider({
              url : new Cesium.Resource({
                  url : "http://api.vworld.kr/req/wms?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080",
                  proxy: new Cesium.DefaultProxy('https://map.vworld.kr/proxy.do?url=')
              }),
              layers: loLAENAM,
              parameters: {
              transparent: true,
              format: "image/png"
              ,version:"1.3.0",CRS:"EPSG:4326"
              },
          }),
        1.0,
        true
      );
      updateLayerList()
      rangeHtml = `<li id="li_${LAENAM.replace(",LP_PA_CBND_BONBUN","")}" style="height: 18px;"><span style="font-size: 0.7em;">${tname}</span>
      <input id="range_${LAENAM}" type="range" min="0" max="1" step="0.01" value="1" style="height: 9px;">
      <span id="close_${LAENAM}" class="center_close" onclick="triggerChk('${tid}')"></span></li>`;
      
    }else{
      //하드 코딩 3D 제어 
      if(treeNode.name=='3D건물'){

        tileset.show = false;
        return;
      }

      if(treeNode.name=='3DTiles'){
        viewer.scene.primitives.remove(etri_tileset)
        return;
      }

        let removeLayer = null;
        viewModel.layers.forEach(function(flayer,i){
          if(flayer.name==LAENAM){
            removeLayer = flayer;
            console.log(i+" 번째 삭제 필요")

            imageryLayers.remove(viewModel.layers[i])
          }
        })
        

        if(LAENAM.indexOf('LP_PA_CBND_BUBUN,LP_PA_CBND_BONBUN')>-1){
          LAENAM = "LP_PA_CBND_BUBUN"; //부번만 조회
        }
        $(`#li_${LAENAM}`).remove()
        updateLayerList();
        if($('#range-ul li').length==0){
          $('#range-noti').hide()

          //결과 WFS 폴리곤 제거 임시 for 문 돌려서 다 지워야 되는데 허허 
          viewer.dataSources.remove(viewer.dataSources.getByName("resultgeojson")[0])

        }
        
    }
    $('#range-ul').prepend(rangeHtml);
};

}) //ztree 기본 종료


function addAdditionalLayerOption(name, imageryProvider, alpha, show) {
  const layer = imageryLayers.addImageryProvider(imageryProvider);
  layer.alpha = Cesium.defaultValue(alpha, 0.5);
  layer.show = Cesium.defaultValue(show, true);
  layer.name = name;
}

function updateLayerList() {
  const numLayers = imageryLayers.length;
  viewModel.layers.splice(0, viewModel.layers.length);
  for (let i = numLayers - 1; i >= 0; --i) {
    viewModel.layers.push(imageryLayers.get(i));
  }
}

const viewModel = {
  layers: [],
  baseLayers: [],
  upLayer: null,
  downLayer: null,
  selectedLayer: null,
  isSelectableLayer: function (layer) {
    return this.baseLayers.indexOf(layer) >= 0;
  },
  raise: function (layer, index) {
    imageryLayers.raise(layer);
    viewModel.upLayer = layer;
    viewModel.downLayer = viewModel.layers[Math.max(0, index - 1)];
    updateLayerList();
    window.setTimeout(function () {
      viewModel.upLayer = viewModel.downLayer = null;
    }, 10);
  },
  lower: function (layer, index) {
    imageryLayers.lower(layer);
    viewModel.upLayer =
      viewModel.layers[
        Math.min(viewModel.layers.length - 1, index + 1)
      ];
    viewModel.downLayer = layer;
    updateLayerList();
    window.setTimeout(function () {
      viewModel.upLayer = viewModel.downLayer = null;
    }, 10);
  },
  canRaise: function (layerIndex) {
    return layerIndex > 0;
  },
  canLower: function (layerIndex) {
    return layerIndex >= 0 && layerIndex < imageryLayers.length - 1;
  },
};

$(document).on('input','[id*=range_]',function(e){ // 레인지 수정 시 알파 값 조절 행정주제도
  var val = $(this).val();
  console.log("range value="+val);
  var lname = $(this).attr("id").replace("range_","");

  imageryLayers._layers.forEach(function(flayer,i){
    if(flayer.name==lname){
      imageryLayers.get([i]).alpha=val
    }
  })
});


//체크박스 트리거 이벤트 구현, 삭제로 활용 
var triggerChk = function(value){
  $(`#${value}_check`).trigger('click')
}

// 지도 변경 시 배경지도 변경 구현 필요
$(document).on('change','#baseMapLayer',function(){
  let this_val = $(this).val();
  console.log(this_val)
  
  img_format = 'jpeg';

  //기존거 제거 
  let removeLayer = null;
  viewModel.layers.forEach(function(flayer,i){
    if(flayer.name=='baseTile'){
      removeLayer = flayer;
      console.log(i+" 번째 삭제 필요")
      imageryLayers.remove(viewModel.layers[i])
    }
  })
  updateLayerList();

  // Satellite , Hybrid
  if(this_val == 'Satellite'){
    addAdditionalLayerOption(
      'baseTile',
      new Cesium.WebMapTileServiceImageryProvider({
        url : `https://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/${this_val}/{TileMatrix}/{TileRow}/{TileCol}.${img_format}`,
        layer : this_val,
        style : 'default',
        format : `img/${img_format}`,
      tileMatrixSetID : '',
        maximumLevel: 19
    }),
      1.0,
      true
    );  
  }else if(this_val == 'Hybrid'){ //2개의 레이어를 올림
    addAdditionalLayerOption(
      'baseTile',
      new Cesium.WebMapTileServiceImageryProvider({
        url : `https://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/Satellite/{TileMatrix}/{TileRow}/{TileCol}.${img_format}`,
        layer : `Satellite`,
        style : 'default',
        format : `img/${img_format}`,
      tileMatrixSetID : '',
        maximumLevel: 19
    }),
      1.0,
      true
    );  

    img_format = "png";
    addAdditionalLayerOption(
      'baseTile',
      new Cesium.WebMapTileServiceImageryProvider({
        url : `https://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/${this_val}/{TileMatrix}/{TileRow}/{TileCol}.${img_format}`,
        layer : this_val,
        style : 'default',
        format : `img/${img_format}`,
      tileMatrixSetID : '',
        maximumLevel: 19
    }),
      1.0,
      true
    );  

  }else{
    img_format = "png";
    addAdditionalLayerOption(
      'baseTile',
      new Cesium.WebMapTileServiceImageryProvider({
        url : `https://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/${this_val}/{TileMatrix}/{TileRow}/{TileCol}.${img_format}`,
        layer : this_val,
        style : 'default',
        format : `img/${img_format}`,
      tileMatrixSetID : '',
        maximumLevel: 19
    }),
      1.0,
      true
    );  
  }

  updateLayerList()
  
})




    


