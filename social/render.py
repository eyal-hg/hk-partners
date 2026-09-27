"""רינדור נכסי המותג ופוסטי הסטודיו — אותה שיטה כמו hk-social/scripts/render.py."""
import html, json, re, subprocess, sys
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
def shot(page: Path, w, h, out: Path):
    subprocess.run([CHROME,"--headless=new","--disable-gpu","--hide-scrollbars","--force-device-scale-factor=1",
        f"--window-size={w},{h}","--virtual-time-budget=6000",f"--screenshot={out}",page.resolve().as_uri()],
        check=True, capture_output=True, timeout=90)
def brand():
    src = (ROOT/"brand/assets.html").read_text(encoding="utf-8")
    for i,w,h,out in [("profile",1080,1080,"profile-1080.png"),("cover",1640,624,"cover-fb-1640x624.png")]+[(f"hl{n}",1080,1080,f"highlight-{n}.png") for n in range(1,6)]:
        disp = "flex" if i=="cover" else "grid"
        p = ROOT/"brand"/f"_{i}.html"
        p.write_text(src.replace("</style>", f"body>*{{display:none!important}}#{i}{{display:{disp}!important}}</style>"), encoding="utf-8")
        shot(p, w, h, ROOT/"brand"/out); p.unlink(); print("brand", out)
def safe_inline(t):
    return re.sub(r"&lt;(/?)(em|span)&gt;", r"<\1\2>", html.escape(t, quote=False))
def posts():
    tpl = (ROOT/"template/post.html").read_text(encoding="utf-8")
    (ROOT/"out").mkdir(exist_ok=True)
    for pj in sorted((ROOT/"posts").rglob("*.json")):
        post = json.loads(pj.read_text(encoding="utf-8"))
        data = {k: post[k] for k in ("layout","body","steps","chat","left","right","photo") if k in post}
        data.update(kicker=post["kicker"], title=safe_inline(post["title"]), cta=safe_inline(post.get("cta","שלושים דקות <span>עם אופיר</span>")))
        src = re.sub(r"/\*POST_JSON\*/.*?/\*END\*/", "/*POST_JSON*/"+json.dumps(data, ensure_ascii=False)+"/*END*/", tpl, flags=re.S)
        p = ROOT/"template"/f"_{post['id']}.html"; p.write_text(src, encoding="utf-8")
        png = ROOT/"out"/f"{post['id']}.png"; shot(p, 1080, 1350, png); p.unlink()
        Image.open(png).convert("RGB").save(ROOT/"out"/f"{post['id']}.jpg", "JPEG", quality=92); png.unlink()
        print("post", post["id"])
if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv)>1 else "all"
    if what in ("all","brand"): brand()
    if what in ("all","posts"): posts()
