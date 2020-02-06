
//var date = new Date().getTime();

//设置localStorage的值
//foowwLocalStorage.set("test", "你好", date + 10000);

//获取localStorage的值
//var data = foowwLocalStorage.get("test");


export const LocalStorage = {

  set: function (key, value, ttl_ms) {
    let data = { value: value, expirse: new Date(ttl_ms).getTime() };
    localStorage.setItem(key, JSON.stringify(data));
  },
  get: function (key) {
    let data = JSON.parse(localStorage.getItem(key));
    if (data !== null) {
      //debugger
      if (data.expirse != null && data.expirse < new Date().getTime()) {
        localStorage.removeItem(key);
      } else {
        return data.value;
      }
    }
    return null;
  }
}

