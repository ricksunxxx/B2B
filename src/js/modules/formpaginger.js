
// 会员中心的列表分页的操作
// 操作页码时，提交表单
// 两个参数，第一个是页码的容器，第二个是要提交的表单
// 当前页和总页数在容器的data上获取: data-current和data-total

function formPaginger(paginger, form){
	var $paginger = $(paginger),
		$form = $(form),
		pageIndexEl = $paginger.find('input[type="text"]'),
		totalEl = $paginger.find('.total');

	var	currentPageIndex = $paginger.data('current') ?  $paginger.data('current') * 1 : 1,
		pageTotal = $paginger.data('total') ?  $paginger.data('total') * 1 : 1;

	$paginger.find('a.ui-paging-item').each(function(){
		$(this).data('index', $(this).text());
	});

	$paginger.delegate('a', 'click', function(e){
		var target = e.target,
			$this = $(target),
			classname = target.className,
			isPage = classname.indexOf('ui-paging-item') > -1,
			isNext = classname.indexOf('ui-paging-next') > -1,
			isPrev = classname.indexOf('ui-paging-prev') > -1,
			isGoto = classname.indexOf('ui-paging-goto') > -1,
			isCurrent = classname.indexOf('ui-paging-current') > -1;
		
		// 点的是当前页，直接返回
		if(isCurrent) return false;

		// 点页码
		if(isPage){	
			pageIndexEl[0] && pageIndexEl.val($this.data('index'));
			$form.submit();
		}

		// 下一页
		if(isNext){
			if(currentPageIndex === pageTotal){
				return false;
			}else{
				currentPageIndex += 1;						
			}

			pageIndexEl && pageIndexEl.val(currentPageIndex);
			$form.submit();
		}

		// 上一页
		if(isPrev){
			if(currentPageIndex === 1){
				return false;
			}else{
				currentPageIndex -= 1;
			}

			pageIndexEl && pageIndexEl.val(currentPageIndex);
			$form.submit();
		}

		// 跳转
		if(isGoto){
			$form.submit();
		}

		return false;
	});
}

module.exports = formPaginger;