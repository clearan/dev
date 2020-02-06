<!--<template>-->

<!--  <div style="-->
<!--    border: 1px solid #ebeef5;-->
<!--    background-color: #fff;-->
<!--    color: #303133;-->
<!--    transition: .3s;-->
<!--    min-height: 798px;"-->
<!--  >-->
<!--    <div class="app-container">-->
<!--      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">-->

<!--        <el-form-item label="短信网关" prop="resource">-->
<!--          <el-radio-group v-model="ruleForm.resource">-->
<!--            <el-radio label="阿里大鱼"></el-radio>-->
<!--            <el-radio label="梦网"></el-radio>-->
<!--            <el-radio label="自定义短信接口"></el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->


<!--        <el-form-item label="阿里云短信签名" prop="name">-->
<!--          <el-input v-model="ruleForm.name"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="阿里云Key" prop="name">-->
<!--          <el-input v-model="ruleForm.name"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="阿里云secret" prop="name">-->
<!--          <el-input v-model="ruleForm.name"></el-input>-->
<!--        </el-form-item>-->

<!--        <el-form-item>-->
<!--          <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>-->
<!--          <el-button @click="resetForm('ruleForm')">重置</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </div>-->

<!--  </div>-->
<!--</template>-->

<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">
      <el-button >短信管理</el-button>
    </div>

  </div>
</template>

