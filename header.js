// Header to be included in all pages

let headerDiv = document.createElement("div");
headerDiv.className = "header";
headerDiv.innerHTML = `
		<ul class="h-menu">
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
		</ul>				
`;
document.body.appendChild(headerDiv);
