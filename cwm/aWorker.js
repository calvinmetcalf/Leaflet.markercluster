importScripts("utils.js","cluster.js");
var rTree,p;
function newR(points){
    points = points || [];
    p=points;
    rTree = new RTree();
     p.forEach(function(v,i){
         rTree.insert(
             {x:v[0],y:v[1],w:0,h:0},v
         );
         });
}
function addToR(pts){
        p = p.concat(pts);
       pts.forEach(function(v,i){
         rTree.insert(
             {x:v[0],y:v[1],w:0,h:0},v
         );
         });
    };
    function getBbox(blat1,blng1,blat2,blng2){
        if(!blat1){
            return p;
        }
        return rTree.search({x:blat1,y:blng1,w:(blat2-blat1),h:(blng2-blng1)});
    };
    function cluster(blat1,blng1,blat2,blng2){
        var points = rTree.search({x:blat1,y:blng1,w:(blat2-blat1),h:(blng2-blng1)});
     var pLen = Math.sqrt(points.length/2);
     var size = boundSize(points);
     var sizeRatio = Math.floor(pLen/((blat2-blat1)/size[0]+(blng2-blng1)/size[1]));
     //self.postMessage({console:[pLen,size,sizeRatio,((blat2-blat1)/size[0]+(blng2-blng1)/size[1])]});
     var out = {points:[],clusters:[]}
  if(pLen>6){
     var clusters = clusterfck.kmeans(points,sizeRatio?sizeRatio:1);
        clusters.forEach(function(pts){
            if(pts.length===0){
                return;
            }else if(pts.length < 4){
               pts.forEach(function(v){out.points.push(v);});
            }else{
                 out.clusters.push([pts.length,hull(pts),centroid(pts)]);
            }
           
        });
  }else{
      points.forEach(
          function(v){out.points.push(v);}
      );
  }
  self.postMessage(out);
    }
  
self.onmessage=function(event){
    switch(event.data.action){
        case "create":
            newR(event.data.points);
            break;
        case "add":
             addToR(event.data.points);
             break;
        case "bbox":
            self.postMessage(getBbox.apply(self,event.data.bounds));
            break;
        case "cluster":
           cluster.apply(self,event.data.bounds);
            break;
        case "tree":
            self.postMessage(JSON.stringify(rTree.get_tree()));
    }
}