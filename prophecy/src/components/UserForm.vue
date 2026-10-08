<template>
  <div class="user-form">
    <h2>八字算命</h2>
    <form @submit.prevent="submitForm" class="form-container">
      <div class="form-group">
        <label for="name">姓名：</label>
        <input 
          id="name" 
          v-model="formData.name" 
          type="text" 
          required
        >
      </div>

      <div class="form-group">
        <label>性别：</label>
        <div class="radio-group">
          <label>
            <input 
              type="radio" 
              v-model="formData.gender" 
              value="男"
            > 男
          </label>
          <label>
            <input 
              type="radio" 
              v-model="formData.gender" 
              value="女"
            > 女
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="birthDate">出生日期：</label>
        <input 
          id="birthDate" 
          v-model="formData.birthDate" 
          type="date" 
          required
        >
      </div>

      <div class="form-group">
        <label for="birthTime">出生时辰：</label>
        <select 
          id="birthTime" 
          v-model="formData.birthTime" 
          required
        >
          <option value="">请选择时辰</option>
          <option v-for="time in chineseHours" :key="time" :value="time">
            {{ time }}
          </option>
        </select>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? '分析中...' : '开始算命' }}
      </button>
    </form>

    <div v-if="result" class="result">
      <h3>算命结果：</h3>
      <div class="result-content" v-html="formattedResult"></div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { getFortuneTelling } from '../services/api'

export default {
  name: 'UserForm',
  setup() {
    const formData = reactive({
      name: '',
      gender: '男',
      birthDate: '',
      birthTime: ''
    })

    const loading = ref(false)
    const result = ref('')
    let eventSourceInstance = null

    const formattedResult = computed(() => {
      return result.value.split('\n').join('<br>')
    })

    const chineseHours = [
      '子时 (23:00-1:00)',
      '丑时 (1:00-3:00)',
      '寅时 (3:00-5:00)',
      '卯时 (5:00-7:00)',
      '辰时 (7:00-9:00)',
      '巳时 (9:00-11:00)',
      '午时 (11:00-13:00)',
      '未时 (13:00-15:00)',
      '申时 (15:00-17:00)',
      '酉时 (17:00-19:00)',
      '戌时 (19:00-21:00)',
      '亥时 (21:00-23:00)'
    ]

    const submitForm = async () => {
      loading.value = true
      result.value = ''
      
      try {
        await getFortuneTelling(
          formData,
          (data) => {
            // 处理接收到的消息
            if (typeof data === 'string') {
              result.value += data;
            } else if (data.response) {
              result.value += data.response;
            } else if (data.message) {
              result.value += data.message;
            }
          },
          (error) => {
            result.value += '\n连接已断开，请重试';
            loading.value = false;
          }
        );
      } catch (error) {
        result.value = '抱歉，算命失败，请稍后重试';
      } finally {
        loading.value = false;
      }
    }

    return {
      formData,
      loading,
      result,
      formattedResult,
      chineseHours,
      submitForm
    }
  }
}
</script>

<style scoped>
.user-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: bold;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.radio-group {
  display: flex;
  gap: 20px;
}

button {
  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.result {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.result-content {
  white-space: pre-wrap;
  line-height: 1.6;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}
</style> 