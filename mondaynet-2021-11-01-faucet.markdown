---
layout: page
title: Mondaynet Faucet
permalink: /mondaynet-2021-11-01-faucet
---

This faucet is for `mondaynet-2021-11-01` only. It will not work on other networks. First, verify that you are a human.

Please use responsibly as the number of addresses is limited. For special requests, contact us.

<script src='https://www.google.com/recaptcha/api.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js'></script>

<form id="faucet_form" mathod="POST" action='https://faucet.mondaynet-2021-11-01.teztnets.xyz'>
    <div>
        <div id="faucet_recaptcha" class="g-recaptcha" data-sitekey="6LcARlgbAAAAAHfqADFawmaQ5U4dceyrdMi1Rtpj" data-callback="captchaDone"></div>
        <br/>
        <button id="gettz" style='display: block; margin: 0 auto; width: 304px; height: 64px;' disabled=true>Get Mondaynet ꜩ</button>
    </div>
</form>

<textarea id="faucet_textarea" readonly cols="50" rows="20" style="visibility:hidden;"></textarea>

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
      console.log(data);
      $("#faucet_textarea").val(data);
      $("#faucet_textarea").show();
    }
  });
});
</script>

## How to use

Download the file above, store it locally (for example in `/tmp/faucet.json`) then run:

```
tezos-client activate account testnet_tez with /tmp/faucet.json
```
