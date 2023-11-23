// Footer to be included in all pages

let footerDiv = document.createElement("div");
footerDiv.className = "footer";
footerDiv.innerHTML = `
<!-- <a href="disclaimer.html">Disclaimer</a> &nbsp; &#9679; &nbsp; &copy; CO<sub>2</sub> Portal 2023 &nbsp; &#9679; &nbsp; Last updated Nov 22 -->
&copy; CO<sub>2</sub> Portal 2023 &nbsp; &#9679; &nbsp; Last updated Nov 23
`;
document.body.appendChild(footerDiv);
