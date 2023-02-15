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

                  //  map.createMarker(title  ,mx        ,my     ,markerhtml      ,"http://map.vworld.kr/images/op02/map_point.png"                );
                var text='';
                if($('[name=type]').val()=='PLACE'){
                    text=`${title}`
                }else if($('[name=category]').val()=='road'){
                    text=`${road}`
                }else if($('[name=category]').val()=='parcel'){
                    text=`${parcel}`
                }
                resultHtml += `<li><a href='#' onclick='move(${mx},${my},500)'>${text}</a></li>`;
                 
            }
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
