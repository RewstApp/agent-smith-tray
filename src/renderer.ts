const links = document.getElementById("links");

window.electronAPI.onUpdateLinks((linksValue: string) => {
  const linksData = JSON.parse(linksValue);
  const linkElements = linksData
    .map(
      (data: any) =>
        `<button type="button" class="btn btn-primary btn-lg">${data.name}</button>`
    )
    .join("");

  if (links) {
    links.innerHTML = linkElements;
  }
});
