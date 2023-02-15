
/**
 * 데이터 API를 이용하여 행정구역 목록 조회
 */

$.support.cors = true;
	
$(function(){
    $.ajax({
        type: "get",
        url: "https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&geometry=false&attribute=true&crs=EPSG:3857&geomfilter=BOX(13663271.680031825,3894007.9689600193,14817776.555251127,4688953.0631258525)&data=LT_C_ADSIDO_INFO",
        async: false,
        dataType: 'jsonp',
        success: function(data) {
            let html = "<option>선택</option>";

            data.response.result.featureCollection.features.forEach(function(f){
                //console.log(f.properties)
                let targetName = "sig_cd";
                let 행정구역코드 = f.properties.ctprvn_cd;
                let 행정구역명 = f.properties.ctp_kor_nm;
                html +=`<option value="${행정구역코드}">${행정구역명}(${행정구역코드})</option>`
                
            })
            
            $('#sido_code').html(html);
            
        },
        error: function(xhr, stat, err) {}
    });
    
    
    $(document).on("change","#sido_code",function(){
        let thisVal = $(this).val();		

        var targetName = "ctprvn_cd";
        var targetCode = thisVal;
        callAjax("LT_C_ADSIDO_INFO",targetName,targetCode);
        if(thisVal=='선택') return;
        $.ajax({
            type: "get",
            url: "https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&geometry=false&attribute=true&crs=EPSG:3857&geomfilter=BOX(13663271.680031825,3894007.9689600193,14817776.555251127,4688953.0631258525)&data=LT_C_ADSIGG_INFO",
            data : {attrfilter : 'sig_cd:like:'+thisVal},
            async: false,
            dataType: 'jsonp',
            success: function(data) {
                let html = "<option>선택</option>";
                
                data.response.result.featureCollection.features.forEach(function(f){
                    //console.log(f.properties)
                    let 행정구역코드 = f.properties.sig_cd;
                    let 행정구역명 = f.properties.sig_kor_nm;
                    
                    html +=`<option value="${행정구역코드}">${행정구역명}(${행정구역코드})</option>`
                    
                })
                $('#sigoon_code').html(html);

                var bbox = data.response.result.featureCollection.bbox;
                var layer = "LT_C_ADSIDO_INFO";
                
            },
            error: function(xhr, stat, err) {}
        });
    });
    
    $(document).on("change","#sigoon_code",function(){ 
        
        let thisVal = $(this).val();
        if(thisVal=='선택') return;		
        var targetName = "sig_cd";
        var targetCode = thisVal;
        callAjax("LT_C_ADSIGG_INFO",targetName,targetCode);
        
        $.ajax({
            type: "get",
            url: "https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&geometry=false&attribute=true&crs=EPSG:3857&geomfilter=BOX(13663271.680031825,3894007.9689600193,14817776.555251127,4688953.0631258525)&data=LT_C_ADEMD_INFO",
            data : {attrfilter : 'emd_cd:like:'+thisVal},
            async: false,
            dataType: 'jsonp',
            success: function(data) {
                let html = "<option>선택</option>";

                data.response.result.featureCollection.features.forEach(function(f){
                    //console.log(f.properties)
                    let 행정구역코드 = f.properties.emd_cd;
                    let 행정구역명 = f.properties.emd_kor_nm;
                    html +=`<option value="${행정구역코드}">${행정구역명}(${행정구역코드})</option>`
                    
                })
                $('#dong_code').html(html);	
            },
            error: function(xhr, stat, err) {}
        });

    });

    // 읍면 코드로 검색
    $(document).on("change","#dong_code",function(){ 
        let thisVal = $(this).val();	
        if(thisVal=='선택') return;
        var targetName = "emd_cd";
        var targetCode = thisVal;
        callAjax("LT_C_ADEMD_INFO",targetName,targetCode);
        
        $.ajax({
            type: "get",
            url: "https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&geometry=false&attribute=true&crs=EPSG:3857&geomfilter=BOX(13663271.680031825,3894007.9689600193,14817776.555251127,4688953.0631258525)&data=LT_C_ADRI_INFO",
            data : {attrfilter : 'li_cd:like:'+thisVal},
            async: false,
            dataType: 'jsonp',
            success: function(data) {
                let html = "<option>선택</option>";
                if(data.response.status=='NOT_FOUND') return;
                data.response.result.featureCollection.features.forEach(function(f){
                    //console.log(f.properties)
                    let 행정구역코드 = f.properties.li_cd;
                    let 행정구역명 = f.properties.li_kor_nm;
                    html +=`<option value="${행정구역코드}">${행정구역명}(${행정구역코드})</option>`
                    
                })
                $('#lee_code').html(html);
            },
            error: function(xhr, stat, err) {}
        });

    });
})

//공간정보를 올리기 위한 폴리곤 조회
var callAjax = function(data,targetName,targetCode){

    $.ajax({
            type: "get",
            url: `https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&geometry=true&attribute=true&crs=EPSG:3857&data=${data}&attrfilter=${targetName}:like:${targetCode}`,
            async: false,
            dataType: 'jsonp',
            success: function(data) {
                let vectorSource = new ol.source.Vector({features: (new ol.format.GeoJSON()).readFeatures(data.response.result.featureCollection)})
                
                // ol.format.GeoJSON()).readFeatures Openlayers에서 제공하는 파서

                map.getLayers().forEach(function(layer){
                    if(layer.get("name")=="search_result"){
                        map.removeLayer(layer);//기존결과 삭제
                    }
                })
                let  vector_layer = new ol.layer.Vector({
                    source: vectorSource,
                    style: styleFunction
                })
                
                vector_layer.set("name","search_result");
                map.addLayer(vector_layer); // 지도 레이어에 데이터 API 호출결과 추가
                
            },
            error: function(xhr, stat, err) {}
    });
}

  /* 폴리곤의 스타일 설정 */
function styleFunction(feature) {

return [
new ol.style.Style({
    fill: new ol.style.Fill({ // 광역 시군 읍면에 따른 색상 변경
    color: feature.get('ctp_kor_nm') == null ? feature.get('sig_kor_nm')==null? 'rgba(255,0,0,0.4)' : 'rgba(0,0,255,0.4)': 'rgba(0,255,0,0.4)'//'rgba(255,0,255,0.4)'
    }),
    stroke: new ol.style.Stroke({
    color: '#3399CC',//'#3399CC',
    width: 1.25
    }),
    text: new ol.style.Text({
        offsetX:0.5, //위치설정
        offsetY:20,   //위치설정
        font: '20px Calibri,sans-serif',
        fill: new ol.style.Fill({ color: '#000' }),
        stroke: new ol.style.Stroke({
            color: '#fff', width: 3
        }),
        text: feature.get('ctp_kor_nm') == null ? feature.get('sig_kor_nm')==null? feature.get('emd_kor_nm') : feature.get('sig_kor_nm'): feature.get('ctp_kor_nm')
    }),
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 10],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'http://map.vworld.kr/images/ol3/marker_blue.png'
    }))
})
];
}