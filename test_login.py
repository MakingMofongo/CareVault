#!/usr/bin/env python3
"""Quick test script to verify login functionality"""

import requests
import json

# Test the login endpoint
def test_login(email, password):
    print(f"\n🧪 Testing login: {email} with password: {password}")
    
    url = "http://localhost:8000/api/auth/token"
    data = {
        "username": email,
        "password": password
    }
    
    try:
        response = requests.post(url, data=data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS! Token: {result['access_token'][:20]}...")
            print(f"User: {result['user']['full_name']} ({result['user']['role']})")
            return True
        else:
            print(f"❌ FAILED! Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

# Test demo users endpoint
def test_demo_users():
    print(f"\n🧪 Testing demo users endpoint")
    
    url = "http://localhost:8000/api/users/demo"
    
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ SUCCESS! Found {len(users)} users:")
            for user in users:
                print(f"  - {user['full_name']} ({user['email']}) - {user['role']}")
            return True
        else:
            print(f"❌ FAILED! Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    print("🚀 CareVault Login Test")
    print("=" * 50)
    
    # Test demo users endpoint first
    test_demo_users()
    
    # Test various login scenarios
    test_cases = [
        ("doctor@demo.com", "any_password"),
        ("john.doe@demo.com", "wrong_password"),
        ("test@example.com", "123456"),  # Should auto-create
        ("newdoctor@demo.com", "demo"),  # Should auto-create as doctor
    ]
    
    success_count = 0
    for email, password in test_cases:
        if test_login(email, password):
            success_count += 1
    
    print(f"\n📊 Results: {success_count}/{len(test_cases)} tests passed")
    
    if success_count == len(test_cases):
        print("🎉 ALL TESTS PASSED! Authentication is working perfectly!")
    else:
        print("⚠️  Some tests failed. Check the API server logs.") 