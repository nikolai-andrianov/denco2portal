// Header to be included in all pages

let headerDiv = document.createElement("div");
headerDiv.className = "header";
headerDiv.innerHTML = `
<nav class="navbar navbar-expand-sm">
	<div class="container-fluid">
		<a class="navbar-brand" href="index.html"><i class="material-icons">home</i></a>
		<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavbar">
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse bg-light opacity-75" id="collapsibleNavbar">
			<ul class="navbar-nav">
				<li class="nav-item dropdown" style="text-align: right;">
					<a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">Project</a>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" style="text-align: right;" href="project.html">Stenlille</a></li>
					</ul>
				</li>			
				<li class="nav-item" style="text-align: right;">
					<a class="nav-link" href="about.html">About</a>
				</li>
				<li class="nav-item" style="text-align: right;">
					<a class="nav-link" href="blog.html">Blog</a>
				</li>
				<li class="nav-item" style="text-align: right;">
					<a class="nav-link" href="disclaimer.html">Disclaimer</a>
				</li>   
				<li class="nav-item" style="text-align: right;">
					<a class="nav-link" href="contact.html">Contact</a>
				</li>   
			</ul>
		</div>
	</div>
</nav>	
`;
document.body.appendChild(headerDiv);
