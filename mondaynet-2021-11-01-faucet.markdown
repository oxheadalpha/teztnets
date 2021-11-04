---
layout: page
title: Mondaynet Faucet
permalink: /mondaynet-2021-11-01-faucet
---

This faucet is for `mondaynet-2021-11-01` only. It will not work on other networks. First, verify that you are a human.

Please use responsibly as the number of addresses is limited. For special requests, contact us.

<script src='https://www.google.com/recaptcha/api.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js'></script>
<script>
function captchaDone(response) {
  $("#gettz").prop('disabled',false); $("#gettz").addClass('btn-b');
}
function submitted() {
  $("#gettz").prop('disabled',true); $("#gettz").removeClass('btn-b');
}
</script>


<form method='POST' action='https://faucet.mondaynet-2021-11-01.teztnets.xyz' onsubmit="submitted()">
    <div>
        <div class="g-recaptcha" data-sitekey="6LcARlgbAAAAAHfqADFawmaQ5U4dceyrdMi1Rtpj" data-callback="captchaDone"></div>
        <br/>
        <button id="gettz" style='display: block; margin: 0 auto; width: 304px; height: 64px;' disabled=true>Get Mondaynet ꜩ</button>
    </div>
</form>
