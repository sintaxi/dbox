$(function(){
	var resultTable = $(".resultTable");

	function metadata(path){
		$.get('/json/metadata/'+path, function(res){
			if (res.status == 200) {
				resultTable.trigger('update', res.result);
			}
		});
	}

	function mkdir(path){
		$.post('/json/mkdir', {path: path}, function(res){
			if (res.status == 200) {
				metadata( currentDir )
			}
		});
	}

	resultTable.on('update', function(e,res){

		var parent = $('tr[data-path="'+res.path+'"]'), lvl, date, el;
		
		if (parent == 0)
			parent = resultTable.find(':first');
		if (parent.length == 0) {//Must create the main
			resultTable.append( rowCreator(res, 1) );
			parent = resultTable.find(':first');
		}

		for (var i = 0; i < res.contents.length; i++){
			el = res.contents[i];
			parent.after( rowCreator(el, parent.data('lvl')+1) );
		}
	});

	function rowCreator(el,lvl){
		var date = new Date( el.modified );

		return '<tr style="cursor:pointer;" data-path="'+el.path+'" data-lvl="'+lvl+'" data-is_dir="'+el.is_dir+'">'+
				'<td>'+ Array(lvl*2).join("&nbsp;") +
					'<img src="/images/dropbox-api-icons/16x16/'+el.icon+'.gif" alt="'+( el.is_dir ? "folder" : el.mime_type )+'"/>'+
					'&nbsp;' + el.path +
				'</td>'+
				'<td>'+ (el.is_dir ? '' : date.toDateString() ) +'</td>'+
				'<td>'+ (el.is_dir ? '' : el.size) +'</td>'+
			'</tr>';
	}

	resultTable.delegate('tr','click',function(e){
		var $this = $(this);
		if ($this.data('is_dir') && $this.next().data('lvl') == $this.data('lvl')){
			metadata( $this.data('path') );
		} else {
			//Need to write some more
		}
	});


	//Setup listeners

	metadata( '/' ); //readdir path initially
});