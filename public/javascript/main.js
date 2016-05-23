$(document).ready(function(){
    
    $("#edit-button").on("click", function(){
	    $("#edit-form").toggleClass("hidden");
	    $("#comment-text").toggleClass("hidden");
    });
    
    $("#delete-comment-button").click(function(event){
        var confirmDel = confirm("Delete comment? Click OK to continue.");
        if(confirmDel){
            $('delete-comment-button').submit();
        } else {
            event.preventDefault();  
        }
    });
    
});