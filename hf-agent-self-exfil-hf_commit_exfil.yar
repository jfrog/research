rule HF_Model_Loot_Exfil_via_Commit_API
{
    meta:
        description = "Python / pickle payload in an HF model that collects host secrets and commits them back to a Hugging Face repo"
        date = "2026-11-24"
        reference = "hfusr5488184/llama-3.2-1b-tuned"

    strings:
        $commit   = "/commit/main" ascii
        $commit2  = "/commit/%s" ascii
        $api      = "huggingface.co/api/models/" ascii
        $ct1      = "application/x-ndjson" ascii
        $ct2      = "application/json" ascii
        $bearer   = "Bearer " ascii
        $loot1    = "loot-%s-%d.json" ascii
        $loot2    = "loot_%s_%s_%d.json" ascii
        $loot3    = "loot/%s-%s.json" ascii
        $loot4    = "/loot\"" ascii
        $summary  = "\"summary\":\"loot \"" ascii
        $mark1    = "NOEXFIL" ascii
        $mark2    = "/tmp/.exec-" ascii
        $mark3    = /_MARK\s*=\s*"RCE[0-9]+/ ascii
        $p1       = "/proc/1/environ" ascii
        $p2       = "serviceaccount/token" ascii
        $b64tok   = "aGZf" ascii   // base64 of "hf_"

    condition:
        filesize < 2MB and
        $api and ($commit or $commit2) and $bearer and any of ($ct*) and
        ( $p1 or $p2 ) and
        ( any of ($loot*) or $summary or any of ($mark*) ) and
        ( $b64tok or any of ($mark*) )
}

rule HF_ChatTemplate_Jinja_SSTI
{
    meta:
        description = "Chat template that reaches Python globals to run OS commands"
        date = "2026-11-24"

    strings:
        $a = "__init__.__globals__" ascii
        $b = "lipsum.__globals__" ascii
        $c = ".__mro__[1].__subclasses__()" ascii
        $os = ".popen(" ascii

    condition:
        filesize < 5MB and $os and 1 of ($a, $b, $c)
}
