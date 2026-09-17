<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%users}}`.
 */
class m240101_000001_create_users_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $updatedAt = $this->timestamp()->notNull()->defaultExpression('CURRENT_TIMESTAMP');
        if ($this->db->driverName === 'mysql') {
            $updatedAt->append('ON UPDATE CURRENT_TIMESTAMP');
        }

        $this->createTable('{{%users}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(255)->notNull(),
            'email' => $this->string(255)->notNull()->unique(),
            'email_verified_at' => $this->timestamp()->null(),
            'password' => $this->string(255)->notNull(),
            'remember_token' => $this->string(100)->null(),
            'current_team_id' => $this->integer()->null(),
            'profile_photo_path' => $this->string(2048)->null(),
            'created_at' => $this->timestamp()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
            'updated_at' => $updatedAt,
            'deleted_at' => $this->timestamp()->null(),
        ]);

        $this->createIndex('idx-users-email', '{{%users}}', 'email');
        $this->createIndex('idx-users-current_team_id', '{{%users}}', 'current_team_id');
        $this->createIndex('idx-users-deleted_at', '{{%users}}', 'deleted_at');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%users}}');
    }
}
