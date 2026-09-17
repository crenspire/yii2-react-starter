<?php

use yii\db\Migration;

/**
 * Adds a `role` column to `{{%users}}`. Only admins can manage users.
 *
 * Promote an existing account with: php yii user/set-role <email> admin
 */
class m240101_000003_add_role_to_users_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('{{%users}}', 'role', $this->string(20)->notNull()->defaultValue('user')->after('password'));
        $this->createIndex('idx-users-role', '{{%users}}', 'role');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropIndex('idx-users-role', '{{%users}}');
        if ($this->db->driverName === 'sqlite') {
            // Yii's SQLite query builder doesn't support dropColumn; SQLite 3.35+ does natively
            $this->execute('ALTER TABLE {{%users}} DROP COLUMN [[role]]');
        } else {
            $this->dropColumn('{{%users}}', 'role');
        }
    }
}
