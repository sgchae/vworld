var search = function(){
    $('[name=size]').val(10);
    $.ajax({
        type: "get",
        url: "https://api.vworld.kr/req/search",
        data : $('#searchForm').serialize(),
        dataType: 'jsonp',
        async: false,
        success: function(data) {
            var resultHtml = "";
            if(data.response.status =="NOT_FOUND"){
                resultHtml=`<li>검색결과가 없습니다.</li>`;
                $('#search_result').html(resultHtml);
                return;
            }
            let chk = false; 
            var entities = [];
            var clusterDataSource = new Cesium.CustomDataSource('myData');

            for(var o in data.response.result.items){ 
                let mx = data.response.result.items[o].point.x*1;
                let my = data.response.result.items[o].point.y*1;
                if(o==0){
                    //move(mx,my,500);
                }
                var title=data.response.result.items[o].title;// map.getLayerNmElement( title ) 제어 가능
                var bldnm = data.response.result.items[o].address.bldnm;
                var parcel = data.response.result.items[o].address.parcel;
                var road = data.response.result.items[o].address.road;
                var markerhtml = "";
                var textx='';
                if($('[name=type]').val()=='PLACE'){
                    textx=`${title}`
                }else if($('[name=category]').val()=='road'){
                    textx=`${road}`
                }else if($('[name=category]').val()=='parcel'){
                    textx=`${parcel}`
                }
                var entty = new Cesium.Entity({
                    position: Cesium.Cartesian3.fromDegrees(mx, my),
                    name: title,
                    bldnm: bldnm,
                    parcel : parcel,
                    road : road, 
                    billboard: {
                        image: 'images/marker_blue.png',
                        width: 32,
                        height: 32,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                    label: {
                        text: textx,
                        font: "20px sans-serif",
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                })
                
                clusterDataSource.entities.add(entty);
                  //  map.createMarker(title  ,mx        ,my     ,markerhtml      ,"http://map.vworld.kr/images/op02/map_point.png"                );

                resultHtml += `<li><a href='#' onclick='move(${mx},${my},500)'>${textx}</a></li>`;
                 
            }
            //데이터 셋팅
            //var clusterDataSource = new Cesium.ClusterDataSource();

            //스타일구성 
            viewer.dataSources.add(clusterDataSource);


            // var clusterBillboards = new Cesium.BillboardCollection();
            // var clusterPoint = new Cesium.PointPrimitiveCollection();
            // clusterPoint.color = Cesium.Color.fromCssColorString('#00ff00');

            //이벤트 등록
            // viewer.screenSpaceEventHandler.setInputAction(function onMouseClick(movement) {
            //     var pickedObject = viewer.scene.pick(movement.position);
            //     if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.cluster) {
            //       var cluster = pickedObject.id;
            //       viewer.flyTo(cluster);
            //       cluster.getEntities().forEach(function(entity) {
            //         console.log(entity.name);
            //       });
            //     }
            // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


            //클러스터 렌더링
            // viewer.scene.primitives.add(clusterBillboards);
            // viewer.scene.primitives.add(clusterPoint);
            clusterDataSource.clustering.enabled = false;
            clusterDataSource.clustering.clusterBillboards = true;
            clusterDataSource.clustering.clusterPoints = true;
            clusterDataSource.clustering.pixelRange = 20;
            clusterDataSource.clustering.minimumClusterSize = 2;
            
            clusterDataSource.clustering.clusterEvent.addEventListener(function(entities, cluster) {
                //cluster.label.show = true;
                //cluster.image
                //cluster.label.text = entities.length.toLocaleString();
            });
            
            $('#search_result').html(resultHtml);
        },
        error: function(xhr, stat, err) {}
    });
}

/** 이동함수 구현
*/
let move = function(x,y,z){  
    flyCesium(x,y,z,360,-90)
}
