document.getElementById("addRoom").addEventListener('mousedown', function(){
    this.style.background = lightenDarkenColor("#92d282", 30);
});
document.getElementById("addRoom").addEventListener('mouseup', function(){
    this.style.background = "#92d282";
});
document.getElementById("addRoom").addEventListener('click', function(){
    console.log("test");
});