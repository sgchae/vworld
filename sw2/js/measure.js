var resetLine = false;
var scene = viewer.scene;
var handlerClick = new Cesium.ScreenSpaceEventHandler(scene.canvas);
function setMeasureLine(){

    handlerClick.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
    if(resetLine){
        resetLine=false; 
        viewer.entities.removeAll()
    }


    var ellipsoid = scene.globe.ellipsoid;
    var geodesic = new Cesium.EllipsoidGeodesic();

    var handlerMovement;
    var points = [];
    
    var labels = new Cesium.LabelCollection({scene: scene});
    scene.primitives.add(labels);
    
    var polyline = {
        width: 4,
        followSurface : true,
        material: new Cesium.PolylineGlowMaterialProperty({
        color: Cesium.Color.ORANGE.withAlpha(0.5)
        
        }),clampToGround: true
    }
    
    var label = {
        font : '14px monospace',
        showBackground : true,
        horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
        verticalOrigin : Cesium.VerticalOrigin.CENTER,
        pixelOffset : new Cesium.Cartesian2(0, 0),
        eyeOffset: new Cesium.Cartesian3(0,0,-50),
        heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND
    }
    

    handlerClick.setInputAction(function(click) {
        var mousePosition = new Cesium.Cartesian2(click.position.x, click.position.y);
        var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
        if (cartesian) {
            var point = new Point(cartesian);
            point.addPoint();
            points.push(point);
            if (points.length > 1) {
                var point1 = points[points.length - 1];
                var point2 = points[points.length - 2];
                addPolyline(point1, point2);
                addDistanceLabel(point1, point2);
            }
        } else {
            alert('Globe was not picked');
        }

        handlerClick.setInputAction(function(){
            handlerClick.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
            resetLine=true;
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
    function getMidpoint(point1, point2) {
        var scratch = new Cesium.Cartographic();
        geodesic.setEndPoints(point1.cartographic, point2.cartographic);
        var midpointCartographic = geodesic.interpolateUsingFraction(0.5, scratch);
        return Cesium.Cartesian3.fromRadians(midpointCartographic.longitude, midpointCartographic.latitude);
    }
    
    function addDistanceLabel(point1, point2) {
        label.text = getDistanceString(point1, point2);
        viewer.entities.add({
            name: 'Distance label',
            position: getMidpoint(point1, point2),
            label: label,
            heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND
        });
    }
    
    function addPolyline(point1, point2) {
        var addPolyline = viewer.entities.add({
            polyline : polyline
            ,clampToGround: true
            ,heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND
        });
        addPolyline.polyline.positions = new Cesium.CallbackProperty(function() {
            var position = [point1.longitude, point1.latitude, point2.longitude, point2.latitude];
            return Cesium.Cartesian3.fromDegreesArray(position);
        }, false)
    }
    
    function getDistanceString(point1, point2) {
        geodesic.setEndPoints(point1.cartographic, point2.cartographic);
        var meters = Math.round(geodesic.surfaceDistance);
        if (meters >= 1000) {
            return (meters / 1000).toFixed(1) + ' km';
        }
        return meters + ' m';
    }
    
    function Point(cartesian) {
        this.cartographic = ellipsoid.cartesianToCartographic(cartesian);
        this.longitude = parseFloat(Cesium.Math.toDegrees(this.cartographic.longitude).toFixed(8));
        this.latitude = parseFloat(Cesium.Math.toDegrees(this.cartographic.latitude).toFixed(8));
        this.addPoint = function() {
            viewer.entities.add({
                name: 'Orange point',
                position : Cesium.Cartesian3.fromDegrees(this.longitude, this.latitude),
                point : {
                    pixelSize : 4,
                    color : Cesium.Color.ORANGE
                    ,clampToGround: true
                    ,heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND
                }
                
            });
        };
    }
}



//초기화 제어 변수 
var resetArea = false;

function setMeasureArea(){
    var positions = [];
    var longlang = [];
    var label;
    var area;
    var scene = viewer.scene;
    if(resetArea){
        resetArea=false; 
        viewer.entities.remove(viewer.entities.getById('areaPolygon'))
        viewer.entities.remove(viewer.entities.getById('measure-noti'))
        viewer.entities.remove(viewer.entities.getById('measure-area'))
    }
    resetLine=true
    setMeasureLine();//라인그리기도 켜기
    var handlerClickM =  new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handlerClickM.setInputAction(function (click) {
        var cartesian = viewer.camera.pickEllipsoid(click.position, scene.globe.ellipsoid);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
        positions.push(position);
        longlang.push([longitude,latitude])

        if (positions.length === 1) {
            label = viewer.entities.add({
                id : 'measure-noti',
                position: positions[0],
                label: {
                    text: "Click to add more points",
                    font : '14px monospace',
                    
                    showBackground : true,
                    pixelOffset: new Cesium.Cartesian2(0, -25),
                    heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND
                }
            });
        }

        if (positions.length > 2) {
            var length = 0;
            var cartesian3s = [];
            for (var i = 0; i < positions.length - 1; i++) {
                cartesian3s.push(positions[i]);
                cartesian3s.push(positions[i + 1]);
                length += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
            }
            if (area) {
                viewer.entities.remove(area);
            }
            area = viewer.entities.add({
                polygon: {
                    hierarchy: new Cesium.PolygonHierarchy(positions),
                    material: Cesium.Color.BLUE.withAlpha(0.5)
                },
                id: 'areaPolygon'
            });
            viewer.entities.remove(viewer.entities.getById('measure-noti'))
            viewer.entities.remove(viewer.entities.getById('measure-area'))


            resultarea = calculateMeasure(longlang);
            
            if(resultarea>1000000){
                resultarea= (resultarea/1000000).toFixed(5)+"km2"
            }else{
                resultarea= (resultarea*1).toFixed(2)+"m2"
            }
            
            
            viewer.entities.add({
                id:"measure-area",
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                label: {
                    //text: "Area: " + Cesium.Cartesian3.fromDegreesArrayHeights(positions).toString() + " (" + (Cesium.Math.toDegrees(Cesium.Cartesian3.computePolygonArea(Cesium.Cartesian3.fromDegreesArray(positions))) * 111000 * 111000).toFixed(2) + " m²)",
                    text:  "Area: " + resultarea ,
                    font : '14px monospace',
                    showBackground : true,
                    pixelOffset: new Cesium.Cartesian2(0, -25),
                    heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND
                }
            });

            viewer.trackedEntity = area;

            handlerClickM.setInputAction(function(){
                handlerClickM.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
                resetArea=true;
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
            
        }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}


// 거리 계산 함수
function calculateDistance(positions) {
  var distance = 0;
  for (var i = 1; i < positions.length; i++) {
    distance += Cesium.Cartesian3.distance(positions[i - 1], positions[i]);
    // const point1 = Cesium.Cartesian3.fromDegrees(positions[i - 1][0], positions[i - 1][1]);
    // const point2 = Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1]);
    // const geodesic = new Cesium.EllipsoidGeodesic(point1, point2);
    // distance += geodesic.surfaceDistance;// 위경도 좌표 기반 거리 재기, 작동하지 않음 NaN
     console.log(distance); 
  }
  return distance.toFixed(2);
}


function calculateMeasure(positions){
    const turfpositions = positions;

    turfpositions.push(positions[0]);
    //area = Cesium.Cartesian3.computePolygonArea(Cesium.Cartesian3.fromDegreesArray(positions))
    var polygon = turf.polygon([turfpositions]);
    var area = turf.area(polygon);
    turfpositions.pop();
    return area;
}

var labelList  = new Cesium.LabelCollection('aaaa');
function setMeasureHeight(){
    viewer.scene.primitives.remove(labelList);

    labelList = new Cesium.LabelCollection('aaaa');
    var annotations = scene.primitives.add(labelList);
    
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    handler.setInputAction(function (movement) {
        const feature = scene.pick(movement.position);
        if (!Cesium.defined(feature)) {
            //return;
        }
        annotate(movement, feature);


    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    function annotate(movement, feature) {
        if (scene.pickPositionSupported) {
          const cartesian = scene.pickPosition(movement.position);
          if (Cesium.defined(cartesian)) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const height = `${cartographic.height.toFixed(2)} m`;
      
            annotations.add({
              position: cartesian,
              text: height,
              showBackground: true,
              font: "14px monospace",
              horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            });
          }
        }
    }

    handler.setInputAction(function(){
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.NONE)
        viewer.scene.primitives.remove(labelList);
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
}