// Footer to be included in all pages

let footerDiv = document.createElement("div");
footerDiv.className = "footer";
footerDiv.innerHTML = `
<br>
<div class="container">
	<div class="row justify-content-md-center">
		<div class="col-lg-3">
			<center>&copy; CO<sub>2</sub> Portal 2024</center>
		</div>
		<div class="col-lg-3">
			<center>Last updated Feb 16</center>
		</div>		
	</div>
</div>
`;
document.body.appendChild(footerDiv);
