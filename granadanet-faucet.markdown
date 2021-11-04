---
layout: page
title: Granadanet Faucet
permalink: /granadanet-faucet
---

This faucet is for `granadanet` only. It will not work on other networks. First, verify that you are a human.

Please use responsibly as the number of addresses is limited. For special requests, contact us.

<script src='https://www.google.com/recaptcha/api.js'></script>
<script>
function captchaDone(response) {
  $("#gettz").prop('disabled',false); $("#gettz").addClass('btn-b');
}
function submitted() {
  $("#gettz").prop('disabled',true); $("#gettz").removeClass('btn-b');
}
</script>


<form method='POST' action='https://faucet.granadanet.teztnets.xyz' onsubmit="submitted()">
    <div>
        <div class="g-recaptcha" data-sitekey="6LcARlgbAAAAAHfqADFawmaQ5U4dceyrdMi1Rtpj" data-callback="captchaDone"></div>
        <br/>
        <button id="gettz" style='display: block; margin: 0 auto; width: 304px; height: 64px;' disabled=true>Get Granadanet ꜩ</button>
    </div>
</form>
