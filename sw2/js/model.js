/**
 * 모델 구현 
 */

handlerModel = new Cesium.ScreenSpaceEventHandler(scene.canvas);
let targetModel = null;
function setModel(model){
    
    handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_CLICK, Cesium.KeyboardEventModifier.NONE)
    handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
    handlerModel.setInputAction(function(movement) {
       $('.model_edit').show()
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

    //이벤트 제거
    handlerModel.setInputAction(function(){
        handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_CLICK, Cesium.KeyboardEventModifier.NONE)
        handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
        viewer.entities.removeAll();
        targetModel = null;
        $('.model_edit').hide()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)


    handlerModel.setInputAction(function(movement) { // 모델의 정보조회 구현 
       
        const feature = scene.pick(movement.position);
        if (Cesium.defined(feature)) {
           console.log(feature+"구현");

           const cartesian = feature.id._position.getValue();
           const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
           long = Cesium.Cartographic.fromCartesian(cartesian).longitude *(180 / Math.PI)
           lang = Cesium.Cartographic.fromCartesian(cartesian).latitude *(180 / Math.PI)
           var height =cartographic.height;
           $('#model_h_value').val(height);
           resultHtml=`경도 : ${long}
            위도 : ${lang} 
            높이 : ${height}`;
           $('#selectModel').html(resultHtml)
           targetModel = feature; 
           
           if(targetModel.id.model.scale==null){ targetModel.id.model.scale=1;}

           $('#model_size_value').val(targetModel.id.model.scale);

        // 구현 필요 모르겠네 해당 객체의 회전값을 가지고 각도로 변환해야 하는데 함수를 못찾겠음 
        //    var hpr = Cesium.HeadingPitchRoll.fromQuaternion(targetModel.id.orientation.getValue());

        //    var heading =  Cesium.Math.toDegrees(hpr.heading);;
        //    var pitch =  Cesium.Math.toDegrees(hpr.pitch);;
        //    var roll =  Cesium.Math.toDegrees(hpr.roll);;
        //    $("#model_x").val(heading)
        //    $("#model_y").val(pitch)
        //    $("#model_z").val(roll)


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
        //minimumPixelSize: 128,  
        //maximumScale: 1,  //이거설정하면 모델 크기 수정이 안됨... 으아 내 시간
      },
    });
    //viewer.trackedEntity = entity; //이화면 고정
    //viewer.trackedEntity=false //고정 해제
    return entity;
  }


  $(document).on('input','[id*=model_]',function(e){ // 레인지 수정 시 알파 값 조절 행정주제도
    thisVal = $(this).val();
    var scale = $("#model_size").val();
    var modelx = $("#model_x").val();
    var modely = $("#model_y").val();
    var modelz = $("#model_z").val();
    var modelh = $("#model_h").val()
    

    if(targetModel!=null){

        if($(this).attr("id")=="model_size"){
            newScale = $(this).val()*1;
            targetModel.id.model.scale = newScale;
            $('#model_size_value').val(newScale)
        }else if($(this).attr("id")=="model_h"){
            //높이 수정 구현 
            var cartesian = targetModel.id._position.getValue();
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            cartographic.height = modelh;//값 변경 
            var ellipsoid = Cesium.Ellipsoid.WGS84; // WGS84 지구 모델
            cartesian = ellipsoid.cartographicToCartesian(cartographic)
            targetModel.id._position.setValue(cartesian); // 위치수정

            $('#model_h_value').val(modelh)
            
        }else{
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(
                targetModel.id._position.getValue(),
                new Cesium.HeadingPitchRoll(
                    Cesium.Math.toRadians(modelx), // 서쪽으로 270도 회전
                    Cesium.Math.toRadians(modely),
                    Cesium.Math.toRadians(modelz)
                )


            );
            $('#model_x_value').val(modelx)
            $('#model_y_value').val(modely)
            $('#model_z_value').val(modelz)

            targetModel.id.orientation.setValue(orientation)
        }

    }

  });

  
//둘러보기 구현 

function around(){
    handlerAround = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
    handlerModel.setInputAction(function(movement) {

        if (scene.pickPositionSupported) {

                const cartesian = scene.pickPosition(movement.position);
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                long = Cesium.Cartographic.fromCartesian(cartesian).longitude *(180 / Math.PI)
                lang = Cesium.Cartographic.fromCartesian(cartesian).latitude *(180 / Math.PI)
                var height =cartographic.height+10;
                height = viewer.scene.globe.getHeight(cartographic)
                var model = 'model/man.glb';
                console.log("long="+long+" lang="+lang+" height="+height+ " model="+model);

                var entity =createModel(model,cartesian,cartographic)

                viewer.trackedEntity = entity
                // setTimeout(function(){
                //     viewer.camera.lookAt(viewer.trackedEntity.position.getValue(), new Cesium.Cartesian3(0, -90, -0));
                // },500)
         
            }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handlerModel.setInputAction(function(){
        handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_CLICK, Cesium.KeyboardEventModifier.NONE)
        handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
        viewer.trackedEntity=false;
        viewer.entities.removeAll();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

}

/**
 *  모델 인풋 파일 업로드 구현
 */
function fileload(){
    var tmppath = window.URL.createObjectURL($('[type=file]')[0].files[0]); //제이쿼리 라이브러리의 파일접근 

    handlerModel.setInputAction(function(movement) {
        if (scene.pickPositionSupported) {
 
             const cartesian = scene.pickPosition(movement.position);
             const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
             long = Cesium.Cartographic.fromCartesian(cartesian).longitude *(180 / Math.PI)
             lang = Cesium.Cartographic.fromCartesian(cartesian).latitude *(180 / Math.PI)
             var height =cartographic.height;
             height = viewer.scene.globe.getHeight(cartographic)
 
             console.log("long="+long+" lang="+lang+" height="+height+ " model="+tmppath);
             createModel(tmppath,cartesian,cartographic)
         }
        $('.model_edit').show()
        handlerModel.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
     }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}
