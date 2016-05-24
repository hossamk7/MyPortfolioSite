$(document).ready(function(){
    
    $(".edit-comment-button").on("click", function(){
        $(this).parent().children("div").toggleClass("hidden");
    });
    
    $(".delete-comment-button").click(function(event){
        var confirmDel = confirm("Delete comment? Click OK to continue.");
        if(confirmDel){
            $('.delete-comment-button').submit();
        } else {
            event.preventDefault();  
        }
    });
    
});