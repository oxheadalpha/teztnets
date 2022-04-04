---
layout: page
title: Dailynet Faucet
permalink: /dailynet-2022-04-04-faucet
---

This faucet is for `dailynet-2022-04-04` only. It will not work on other networks.

Please use responsibly as the number of addresses is limited. For special requests, contact us.

<script src='https://www.google.com/recaptcha/api.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js'></script>
<form id="faucet_form" mathod="POST" action='https://faucet.dailynet-2022-04-04.teztnets.xyz'>
    <div>
        <div id="faucet_recaptcha" class="g-recaptcha" data-sitekey="6LcARlgbAAAAAHfqADFawmaQ5U4dceyrdMi1Rtpj" data-callback="captchaDone"></div>
        <br/>
        <button id="gettz" style='display: block; margin: 0 auto; width: 304px; height: 64px;' disabled=true>Get Dailynet ꜩ</button>
    </div>
</form>

<p class="faucet_response" style="display:none;">Here is your activation key:</p>
<p class="faucet_response" style="display:none;"> <textarea id="faucet_textarea" readonly cols="80" rows="25"></textarea> </p>
<p class="faucet_response" style="display:none;">
  <button onclick="copyToClipboard()">Copy to clipboard</button>
  <a id="download_button"><button>Download</button></a>
</p>

## How to use

Download the activation file, store it locally (for example in `/tmp/dailynet-2022-04-04.json`) then run:

```
tezos-client activate account faucet with /tmp/dailynet-2022-04-04.json
```

<p class="faucet_response" style="display:none;">Or directly use the snippet below:</p>

<div class="faucet_response language-plaintext highlighter-rouge" style="display:none;"><div class="highlight"><pre class="highlight"><code>cat &lt;&lt; EOF &gt; /tmp/dailynet-2022-04-04.json
<span id="inline_snippet"></span>
EOF
tezos-client activate account faucet with /tmp/dailynet-2022-04-04.json
</code></pre></div></div>

<script>
function captchaDone(response) {
  $("#gettz").prop('disabled',false); $("#gettz").addClass('btn-b');
}

//https://stackoverflow.com/a/6960586/207209
$("#faucet_form").submit(function(e){
  e.preventDefault();
  $("#gettz").prop('disabled',true); $("#gettz").removeClass('btn-b');
  $("#faucet_recaptcha").hide();
  var form = $(this);
  var url = form.attr('action');

  $.ajax({
    type: "POST",
    url: url,
    data: form.serialize(), // serializes the form's elements.
    success: function(data)
    {
      $("#faucet_textarea").val(JSON.stringify(data,null,'\t'));
      $("#inline_snippet").text(JSON.stringify(data, null, '\t'));
      $(".faucet_response").show();
    }
  });
});

function copyToClipboard() {
  $("#faucet_textarea").select();
  document.execCommand("copy");
}
$("#download_button").click(function() {
    contentType =  'data:application/json,';
    uriContent = contentType + encodeURIComponent($('#faucet_textarea').val());
    this.setAttribute('href', uriContent);
    this.setAttribute('download', 'dailynet-2022-04-04.json');
})
</script>
