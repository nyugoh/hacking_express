function genSlug(){
  var name = $('#hackName').val();
  var url = '';
  var slug = name.split(' ');
  for (var s in slug) {
    url = url + slug[s].toLowerCase().trim();
  }
  $('#slug').attr('value', url);
}

function showEditForm(){
  var html = "<form action="\/hacks\/editForm" method="post">";
}
