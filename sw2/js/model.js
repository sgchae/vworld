handlerModel = new Cesium.ScreenSpaceEventHandler(scene.canvas);
var targetModel = null;
function setModel(model){
    
    handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_CLICK, Cesium.KeyboardEventModifier.NONE)
    handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
    handlerModel.setInputAction(function(movement) {
       
        //model/building.glb
        //model/tree.glb
        //model/car.glb
        if (scene.pickPositionSupported) {

            const cartesian = scene.pickPosition(movement.position);
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            long = Cesium.Cartographic.fromCartesian(cartesian).longitude *(180 / Math.PI)
            lang = Cesium.Cartographic.fromCartesian(cartesian).latitude *(180 / Math.PI)
            var height =cartographic.height;
            height = viewer.scene.globe.getHeight(cartographic)

            console.log("long="+long+" lang="+lang+" height="+height+ " model="+model);
            createModel(model,cartesian,cartographic)
        }

    }, Cesium.ScreenSpaceEventType.MIDDLE_CLICK)

    handlerModel.setInputAction(function(){
        handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_CLICK, Cesium.KeyboardEventModifier.NONE)
        handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
        viewer.entities.removeAll();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)


    handlerModel.setInputAction(function(movement) {
       
        const feature = scene.pick(movement.position);
        if (Cesium.defined(feature)) {
           console.log(feature+"구현");

           const cartesian = feature.id._position.getValue();
           const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
           long = Cesium.Cartographic.fromCartesian(cartesian).longitude *(180 / Math.PI)
           lang = Cesium.Cartographic.fromCartesian(cartesian).latitude *(180 / Math.PI)
           var height =cartographic.height;
           resultHtml=`경도 : ${long}, 위도 : ${lang} 높이 : ${height}`;
           $('#selectModel').html(resultHtml)
           targetModel = feature; 
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)


    
}

function createModel(url,cartesian,cartographic) {
    //viewer.entities.removeAll();
  
    const heading = Cesium.Math.toRadians(135);
    const pitch = 0;
    const roll = 0;
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        cartesian,
      hpr
    );
        
    let entity = viewer.entities.add({
      name: url,
      position: cartesian,
      orientation: orientation,
      model: {
        uri: url,
        minimumPixelSize: 128,
        maximumScale: 1,
      },
    });
    //viewer.trackedEntity = entity; //이화면 고정
    //viewer.trackedEntity=false //고정 해제
    return entity;
  }
  
  
  