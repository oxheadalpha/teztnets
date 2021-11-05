---
layout: page
title: Dailynet Faucet
permalink: /dailynet-2021-11-05-faucet
---

This faucet is for `dailynet-2021-11-05` only. It will not work on other networks. First, verify that you are a human.

Please use responsibly as the number of addresses is limited. For special requests, contact us.

<script src='https://www.google.com/recaptcha/api.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js'></script>

<form id="faucet_form" mathod="POST" action='https://faucet.dailynet-2021-11-05.teztnets.xyz'>
    <div>
        <div class="g-recaptcha" data-sitekey="6LcARlgbAAAAAHfqADFawmaQ5U4dceyrdMi1Rtpj" data-callback="captchaDone"></div>
        <br/>
        <button id="gettz" style='display: block; margin: 0 auto; width: 304px; height: 64px;' disabled=true>Get Dailynet ꜩ</button>
    </div>
</form>

<script>
function captchaDone(response) {
  $("#gettz").prop('disabled',false); $("#gettz").addClass('btn-b');
}

//https://stackoverflow.com/a/6960586/207209
$("#faucet_form").submit(function(e){
  e.preventDefault();
  $("#gettz").prop('disabled',true); $("#gettz").removeClass('btn-b');
  var form = $(this);
  var url = form.attr('action');

  $.ajax({
    type: "POST",
    url: url,
    data: form.serialize(), // serializes the form's elements.
    success: function(data)
    {
      alert(data);
    }
  });
});
</script>
