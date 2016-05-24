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
    
});