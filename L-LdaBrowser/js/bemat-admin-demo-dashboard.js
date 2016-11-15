/**
 * bemat-admin-demo.js v1.0.0
 * http://www.cerocreativo.cl
 *
 * Copyright 2015, Cerocreativo.cl
 * http://www.cerocreativo.cl
 */

	/**
	 * Simple Pie Charts
	 */
	$(function($) {
		setProgress(0);

		function setProgress(){
			var progress = rand(0,100);
			if (progress > 100) {
				progress = 1;
			}

			$(".bemat-pie-chart-live-update").simplePieChart("set",progress);
			var timeOut = setTimeout(function(){
				setProgress();
			},2000);
		}
	});



	/**
	 * Peity
	 */
	$(function($) {
		$(".peity-line").peity("line",{
			height: 28,
			width: 64
		});
		$(".peity-bar").peity("bar",{
			height: 28,
			width: 64
		});
		$(".peity-donut").peity("donut",{
			height: 28,
			width: 64
		});
		$(".peity-pie").peity("pie",{
			height: 28,
			width: 64
		});
	});

})();