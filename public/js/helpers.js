function copyToClipboard(copyText) {

    var temp = $("<input>");
    $("body").append(temp);

    temp.val(copyText).select();

    document.execCommand("copy");
    temp.remove();
  }