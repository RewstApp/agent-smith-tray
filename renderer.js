const links = document.getElementById("links");

window.electronAPI.onUpdateLinks((linksValue) => {
  console.log(linksValue);
  links.innerText = linksValue;
});
