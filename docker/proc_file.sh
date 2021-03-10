#!/bin/sh


echo "处理jd_crazy_joy_coin任务。。。"
if [ ! $CRZAY_JOY_COIN_ENABLE ]; then
   echo "默认启用jd_crazy_joy_coin杀掉jd_crazy_joy_coin任务，并重启"
   eval $(ps -ef | grep "jd_crazy" | grep -v "grep" | awk '{print "kill "$1}')
   echo '' >/scripts/logs/jd_crazy_joy_coin.log
   node /scripts/jd_crazy_joy_coin.js | ts >>/scripts/logs/jd_crazy_joy_coin.log 2>&1 &
   echo "默认jd_crazy_joy_coin重启完成"
else
   if [ $CRZAY_JOY_COIN_ENABLE = "Y" ]; then
      echo "配置启用jd_crazy_joy_coin，杀掉jd_crazy_joy_coin任务，并重启"
      eval $(ps -ef | grep "jd_crazy" | grep -v "grep" | awk '{print "kill "$1}')
      echo '' >/scripts/logs/jd_crazy_joy_coin.log
      node /scripts/jd_crazy_joy_coin.js | ts >>/scripts/logs/jd_crazy_joy_coin.log 2>&1 &
      echo "配置jd_crazy_joy_coin重启完成"
   else
      eval $(ps -ef | grep "jd_crazy" | grep -v "grep" | awk '{print "kill "$1}')
      echo "已配置不启用jd_crazy_joy_coin任务，不处理"
   fi
fi
