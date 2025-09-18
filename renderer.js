const links = document.getElementById("links");

window.electronAPI.onUpdateLinks((linksValue) => {
  const linksData = JSON.parse(linksValue);

  const linkElements = linksData
    .map(
      (data) =>
        `<button type="button" class="btn btn-primary btn-lg">${data.name}</button>`
    )
    .join("");

  links.innerHTML = linkElements;
});
