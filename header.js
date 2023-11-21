// Header to be included in all pages

let headerDiv = document.createElement("div");
headerDiv.className = "header";
headerDiv.innerHTML = `
<ul class="h-menu">
	<li><a href="index.html"><h5><i class="icon-home"></i></h5></a></li>
	<li>
		<a href="#" class="dropdown-toggle">Project</a>
		<ul class="d-menu" data-role="dropdown">
			<li><a href="project.html">Open</a></li>
			<li class="divider"></li>
			<li><a href="#">Close</a></li>
		</ul>
	</li>
	<li><a href="blog.html">Blog</a></li> 
	<li><a href="about.html">About</a></li>
	<li><a href="disclaimer.html">Disclaimer</a></li>
</ul>				
`;
document.body.appendChild(headerDiv);
