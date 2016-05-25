$(document).ready(function(){
    
    $(".edit-comment-button").on("click", function(){
        $(this).parent().children("div").toggleClass("hidden");
    });
    
    $(".delete-button").click(function(event){
        var confirmDel = confirm("Are you sure you want to delete this? Click OK to continue.");
        if(confirmDel){
            $('.delete-button').submit();
        } else {
            event.preventDefault();  
        }
    });
    
    $("#add-comment").on("click", function(event) {
        alert("Please log in to add comments");
    });
    
    
    $("#signup").on("submit", function(event) {
        if($("#signup input:nth-of-type(2)").val() === $("#signup input:nth-of-type(3)").val()){
            $(this).submit();
        } else {
            alert("Password fields do not match, please re-enter.");
            event.preventDefault();
        } 
    });
});