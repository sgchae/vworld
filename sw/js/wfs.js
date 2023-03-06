
var baseClick = new Cesium.ScreenSpaceEventHandler(scene.canvas);
baseClick.setInputAction(function(click) {
  console.log(click)
  var cartesian = viewer.camera.pickEllipsoid(click.position, scene.globe.ellipsoid);  // 마우스 클릭 위치의 3D 좌표를 가져옴
  if (cartesian) {
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);  // 3D 좌표를 위경도 좌표로 변환
    var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);  // 경도를 도 단위로 변환하고 소수점 7자리까지 표시
    var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);  // 위도를 도 단위로 변환하고 소수점 7자리까지 표시
    console.log("클릭한 위치의 위도: " + latitude + ", 경도: " + longitude);
    var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(viewer.camera.position);
    var height = cartographic.height;

    var mh = getBuffer(longitude,latitude,height);

    let min = [longitude*1-mh[0],latitude*1-mh[1]]
    let max = [longitude*1+mh[0],latitude*1+mh[1]]
    let box = min[0]+","+min[1]+","+max[0]+","+max[1]

    if($('#range-ul li').length>0){
      
      //첫번째 인자 조회
      let TYPENAME = $('#range-ul li').attr("id").replace("li_","").toLowerCase()
      
      if(TYPENAME.indexOf('lp_pa_cbnd_bubun,lp_pa_cbnd_bonbun')>-1){
        TYPENAME = "lp_pa_cbnd_bubun"; //부번만 조회
      }

      
      let targeturl = `https://map.vworld.kr/proxy.do?url=`;
      let encoding = `http://api.vworld.kr/req/wfs?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&SERVICE=WFS&version=1.1.0&request=GetFeature`+
      `&TYPENAME=${TYPENAME}&OUTPUT=application/json&SRSNAME=EPSG:4326&BBOX=${box}`
      const geoJsonPromise = fetch(targeturl+encodeURIComponent(encoding)).then(res => res.json())


      viewer.dataSources.remove(viewer.dataSources.getByName("resultgeojson")[0]) //기존결과 제거 임시

      var resultgeojson = new Cesium.GeoJsonDataSource("resultgeojson")
      geoJsonPromise.then(geoJson =>{
        viewer.dataSources.add(
            resultgeojson.load(
              geoJson,
                { fill: Cesium.Color.PINK,
                    clampToGround : true ,
                    material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 1.6,
                    color: Cesium.Color.YELLOW
                    }), 
                    width: 10
                    ,name:"wfsPolygon"
                    ,id:"wfsPolygonId"
                }

            )
        )

        
                // 라벨 구현 


        }).then(data=>{

            //폴리곤 엔티티를 폴리라인 엔티티로 변경 안됨 시간 남으면 해야지 
            var entities = resultgeojson.entities.values;
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity.polygon) {
                var hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
                var polyline = new Cesium.PolylineGraphics({
                    positions: hierarchy.positions,
                    width: entity.polygon.outlineWidth,
                    material: entity.polygon.outlineColor
                });
                entity.polyline = polyline;
                entity.polygon = undefined;
                }
            }

        })

     
      //html 생성

     

    } //if checkbox 종료
    else{
        //metadataOverlay.style.display = "none";
    }
  }//if 클릭이벤트 이프 

},Cesium.ScreenSpaceEventType.MIDDLE_CLICK)

//대략적인 마우스 클릭 크기에 맞는 BBOX 영역 계산
var getBuffer = function(x,y,z){


    //111,000KM  1도 단위
    //var m = 1/(111000/z*1.48*50);
    //var h = 1/(111000/z*1.85*50); 

    m = 0.00000001
    h = 0.00000001

    return [m,h];
}


