<script setup lang="ts">
import { onError } from '@dcloudio/uni-app'

onError((err) => {
  console.error('错误捕获', err)
})
</script>

<style lang="scss">
:root,
page {
  --wd-primary-color: #1296db;
  --wd-secondary-color: #e8f0fe;
  --wd-text-primary-color: black;
  --wd-text-secondary-color: #5f6368;
}
</style>
