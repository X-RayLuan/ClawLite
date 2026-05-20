"""
ClawLite Blog Admin API - 单元测试
"""
import requests
import hmac
import hashlib
import base64
import time
import json
import sys

# ── 配置 ─────────────────────────────────────────────
BASE_URL = "https://clawlite.ai"
JWT_SECRET = "R2zjFHnVL8snSkL54kyWN0N5d0jKRAkPxJSavLzDjEg="
ADMIN_USER_ID = "d39a874e-d4e5-4047-b27f-d76edc3638fb"
EMAIL = "luanxr2000@gmail.com"


def b64url(data):
    if isinstance(data, str):
        data = data.encode()
    return base64.b64encode(data).decode().rstrip("=").replace("+", "-").replace("/", "_")


def make_token(uid: str, email: str, secret: str) -> str:
    h = b64url('{"alg":"HS256","typ":"JWT"}')
    now = int(time.time())
    p = b64url(
        json.dumps(
            {
                "admin_user_id": uid,
                "email": email,
                "role": "admin",
                "iat": now,
                "exp": now + 604800,
            }
        )
    )
    sig = b64url(
        hmac.new(secret.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest()
    )
    return f"{h}.{p}.{sig}"


class TestBlogAPI:
    def __init__(self):
        self.token = make_token(ADMIN_USER_ID, EMAIL, JWT_SECRET)
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.published_slug = None
        self.published_id = None

    # ── 1. 生成 Token ─────────────────────────────────
    def test_token_generation(self):
        print("\n✅ [1/6] Token 生成成功")
        print(f"   Token: {self.token[:50]}...")
        return True

    # ── 2. 上传图片 ────────────────────────────────────
    def test_upload_image(self):
        print("\n🌄 [2/6] 测试图片上传...")
        # 创建一个 1x1 红色 PNG (最小的有效 PNG)
        png_data = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
            b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00"
            b"\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00"
            b"\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        try:
            r = requests.post(
                f"{BASE_URL}/api/admin/blog/upload",
                files={"file": ("test.png", png_data, "image/png")},
                headers=self.headers,
                timeout=15,
            )
            result = r.json()
            print(f"   Status: {r.status_code}")
            print(f"   Response: {json.dumps(result, indent=4)}")
            if result.get("ok"):
                print(f"   图片 URL: {result['url']}")
                return True
            else:
                print(f"   ❌ 上传失败: {result.get('error')}")
                return False
        except Exception as e:
            print(f"   ❌ 请求异常: {e}")
            return False

    # ── 3. 发布文章 ────────────────────────────────────
    def test_publish_blog(self):
        print("\n📝 [3/6] 测试发布文章...")
        timestamp = int(time.time())
        slug = f"test-blog-{timestamp}"
        payload = {
            "slug": slug,
            "title": f"Test Blog Post {timestamp}",
            "excerpt": "This is a test blog post created by unit test.",
            "content": f"""
<h2>Test Post</h2>
<p>This is a test blog post created at {timestamp}.</p>
<p>If you can read this, the Blog API is working correctly!</p>
<ul>
    <li>Feature 1: Working</li>
    <li>Feature 2: Working</li>
    <li>Feature 3: Working</li>
</ul>
""",
        }
        try:
            r = requests.post(
                f"{BASE_URL}/api/admin/blog",
                json=payload,
                headers=self.headers,
                timeout=15,
            )
            result = r.json()
            print(f"   Status: {r.status_code}")
            print(f"   Response: {json.dumps(result, indent=4)}")
            if result.get("ok"):
                self.published_slug = slug
                self.published_id = result["data"]["id"]
                print(f"   ✅ 发布成功! slug={slug}, id={self.published_id}")
                return True
            else:
                print(f"   ❌ 发布失败: {result.get('error')}")
                return False
        except Exception as e:
            print(f"   ❌ 请求异常: {e}")
            return False

    # ── 4. 获取文章列表 ─────────────────────────────────
    def test_list_blogs(self):
        print("\n📋 [4/6] 测试获取文章列表...")
        try:
            r = requests.get(
                f"{BASE_URL}/api/admin/blog?page=1&page_size=5",
                headers=self.headers,
                timeout=15,
            )
            result = r.json()
            print(f"   Status: {r.status_code}")
            if result.get("ok"):
                posts = result["data"]["posts"]
                pagination = result["data"]["pagination"]
                print(f"   ✅ 列表获取成功, 共 {pagination['total']} 篇")
                for post in posts[:3]:
                    print(f"   - [{post['slug']}] {post['title']}")
                return True
            else:
                print(f"   ❌ 获取失败: {result.get('error')}")
                return False
        except Exception as e:
            print(f"   ❌ 请求异常: {e}")
            return False

    # ── 5. 获取单篇文章 ─────────────────────────────────
    def test_get_blog(self):
        if not self.published_id:
            print("\n🔍 [5/6] 跳过（无已发布文章 ID）")
            return True
        print(f"\n🔍 [5/6] 测试获取单篇文章 (id={self.published_id})...")
        try:
            r = requests.get(
                f"{BASE_URL}/api/admin/blog/{self.published_id}",
                headers=self.headers,
                timeout=15,
            )
            result = r.json()
            print(f"   Status: {r.status_code}")
            if result.get("ok"):
                post = result["data"]
                print(f"   ✅ 获取成功: [{post['slug']}] {post['title']}")
                return True
            else:
                print(f"   ❌ 获取失败: {result.get('error')}")
                return False
        except Exception as e:
            print(f"   ❌ 请求异常: {e}")
            return False

    # ── 6. 删除测试文章 ─────────────────────────────────
    def test_delete_blog(self):
        if not self.published_id:
            print("\n🗑️  [6/6] 跳过（无已发布文章 ID）")
            return True
        print(f"\n🗑️  [6/6] 测试删除文章 (id={self.published_id})...")
        try:
            r = requests.delete(
                f"{BASE_URL}/api/admin/blog/{self.published_id}",
                headers=self.headers,
                timeout=15,
            )
            result = r.json()
            print(f"   Status: {r.status_code}")
            print(f"   Response: {json.dumps(result, indent=4)}")
            if result.get("ok"):
                print(f"   ✅ 删除成功!")
                return True
            else:
                print(f"   ❌ 删除失败: {result.get('error')}")
                return False
        except Exception as e:
            print(f"   ❌ 请求异常: {e}")
            return False

    # ── 运行全部测试 ────────────────────────────────────
    def run_all(self):
        print("=" * 50)
        print("ClawLite Blog Admin API - 单元测试")
        print("=" * 50)

        tests = [
            self.test_token_generation,
            self.test_upload_image,
            self.test_publish_blog,
            self.test_list_blogs,
            self.test_get_blog,
            self.test_delete_blog,
        ]

        results = []
        for t in tests:
            try:
                results.append(t())
            except Exception as e:
                print(f"   ❌ 测试异常: {e}")
                results.append(False)

        print("\n" + "=" * 50)
        passed = sum(results)
        total = len(results)
        print(f"测试结果: {passed}/{total} 通过")
        if passed == total:
            print("🎉 全部通过!")
        else:
            print("⚠️  部分测试失败")
            sys.exit(1)


if __name__ == "__main__":
    tester = TestBlogAPI()
    tester.run_all()
