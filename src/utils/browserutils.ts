// @ts-nocheck
export const downloadContent = (filename: string, contents: string) => {
	const element = document.createElement("a");
	element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(contents));
	element.setAttribute("download", filename);
	element.style.display = "none";
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};

export const downloadContentBig = (filename: string, contents: string) => {
	var createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function () {};
	var blob = null;
	var content = contents;
	var mimeString = "application/octet-stream";
	window.BlobBuilder =
		window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;

	if (window.BlobBuilder) {
		var bb = new BlobBuilder();
		bb.append(content);
		blob = bb.getBlob(mimeString);
	} else {
		blob = new Blob([content], { type: mimeString });
	}
	var url = createObjectURL(blob);
	var a = document.createElement("a");
	a.style.display = "none";
	a.href = url;
	a.download = filename;
	a.innerHTML = "download";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
};
