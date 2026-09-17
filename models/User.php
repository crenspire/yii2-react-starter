<?php

namespace app\models;

use Yii;
use yii\base\NotSupportedException;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\db\Expression;
use yii\web\IdentityInterface;
use app\behaviors\SoftDeleteBehavior;

/**
 * User model
 *
 * @property integer $id
 * @property string $name
 * @property string $email
 * @property string $role
 * @property string $remember_token
 * @property integer $current_team_id
 * @property string $profile_photo_path
 * @property string $email_verified_at
 * @property string $deleted_at
 * @property string $created_at
 * @property string $updated_at
 *
 * The `password` database column stores the password hash. Assign a plain-text password to the
 * virtual $password property; it is hashed in beforeSave().
 *
 * @mixin SoftDeleteBehavior
 */
class User extends ActiveRecord implements IdentityInterface
{
    const ROLE_ADMIN = 'admin';
    const ROLE_USER = 'user';

    /** Self sign-up: name, email and password */
    const SCENARIO_REGISTER = 'register';
    /** Admin creating a user: password required, role assignable */
    const SCENARIO_ADMIN_CREATE = 'admin-create';
    /** Admin editing a user: password optional, role assignable */
    const SCENARIO_ADMIN_UPDATE = 'admin-update';

    /**
     * @var string|null plain-text password input (virtual attribute)
     */
    public $password;

    /**
     * @var string|null password confirmation input (virtual attribute)
     */
    public $password_confirm;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%users}}';
    }

    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::class,
                'value' => new Expression('CURRENT_TIMESTAMP'),
            ],
            SoftDeleteBehavior::class,
        ];
    }

    /**
     * Excludes soft-deleted records. Use findWithTrashed() to include them.
     *
     * @return \yii\db\ActiveQuery
     */
    public static function find()
    {
        return parent::find()->andWhere([static::tableName() . '.deleted_at' => null]);
    }

    /**
     * @return \yii\db\ActiveQuery query that includes soft-deleted records
     */
    public static function findWithTrashed()
    {
        return parent::find();
    }

    /**
     * Only the attributes listed here can be mass-assigned with load().
     * Timestamps, verification state, role (outside admin scenarios) and tokens never can.
     *
     * {@inheritdoc}
     */
    public function scenarios()
    {
        return [
            self::SCENARIO_DEFAULT => ['name', 'email'],
            self::SCENARIO_REGISTER => ['name', 'email', 'password', 'password_confirm'],
            self::SCENARIO_ADMIN_CREATE => ['name', 'email', 'password', 'role'],
            self::SCENARIO_ADMIN_UPDATE => ['name', 'email', 'password', 'role'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['name', 'email'], 'trim'],
            ['email', 'filter', 'filter' => 'mb_strtolower'],
            [['name', 'email'], 'required'],
            [['name', 'email'], 'string', 'max' => 255],
            ['email', 'email'],
            ['email', 'validateEmailUnique'],
            ['password', 'required', 'on' => [self::SCENARIO_REGISTER, self::SCENARIO_ADMIN_CREATE]],
            ['password', 'string', 'min' => 8, 'max' => 72],
            ['password_confirm', 'required', 'on' => self::SCENARIO_REGISTER],
            ['password_confirm', 'compare', 'compareAttribute' => 'password', 'message' => 'Passwords do not match.'],
            ['role', 'required', 'on' => [self::SCENARIO_ADMIN_CREATE, self::SCENARIO_ADMIN_UPDATE]],
            ['role', 'in', 'range' => array_keys(self::roles())],
        ];
    }

    /**
     * Emails must be unique across all users, including soft-deleted ones, because the
     * database enforces a unique index on the column.
     *
     * @param string $attribute
     */
    public function validateEmailUnique($attribute)
    {
        $query = static::findWithTrashed()->andWhere(['email' => $this->$attribute]);
        if (!$this->isNewRecord) {
            $query->andWhere(['!=', 'id', $this->id]);
        }
        if ($query->exists()) {
            $this->addError($attribute, 'This email address has already been taken.');
        }
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'email' => 'Email',
            'role' => 'Role',
            'password' => 'Password',
            'password_confirm' => 'Password confirmation',
            'email_verified_at' => 'Email Verified At',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * Attributes exposed when the model is serialized (e.g. passed to Inertia as props).
     * The password hash and remember token are never included.
     *
     * {@inheritdoc}
     */
    public function fields()
    {
        return ['id', 'name', 'email', 'role', 'email_verified_at', 'created_at', 'updated_at'];
    }

    /**
     * @return array<string, string> role value => label
     */
    public static function roles()
    {
        return [
            self::ROLE_USER => 'User',
            self::ROLE_ADMIN => 'Admin',
        ];
    }

    /**
     * @return bool
     */
    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * {@inheritdoc}
     */
    public static function findIdentity($id)
    {
        return static::findOne(['id' => $id]);
    }

    /**
     * {@inheritdoc}
     */
    public static function findIdentityByAccessToken($token, $type = null)
    {
        throw new NotSupportedException('Access token authentication is not implemented.');
    }

    /**
     * Finds an active (not soft-deleted) user by email
     *
     * @param string $email
     * @return static|null
     */
    public static function findByEmail($email)
    {
        return static::findOne(['email' => mb_strtolower(trim((string) $email))]);
    }

    /**
     * {@inheritdoc}
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * {@inheritdoc}
     */
    public function getAuthKey()
    {
        return $this->remember_token;
    }

    /**
     * {@inheritdoc}
     */
    public function validateAuthKey($authKey)
    {
        return is_string($authKey) && is_string($this->remember_token)
            && hash_equals($this->remember_token, $authKey);
    }

    /**
     * Validates password
     *
     * @param string $password password to validate
     * @return bool if password provided is valid for current user
     */
    public function validatePassword($password)
    {
        $hash = $this->getAttribute('password');
        if (empty($hash) || !is_string($password) || $password === '') {
            return false;
        }
        return Yii::$app->security->validatePassword($password, $hash);
    }

    /**
     * Sets a new plain-text password; it is hashed when the model is saved.
     *
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password = $password;
    }

    /**
     * Generates a new auth key. Changing it invalidates "remember me" cookies and
     * signs the user out of every other session.
     */
    public function generateRememberToken()
    {
        $this->remember_token = Yii::$app->security->generateRandomString(60);
    }

    /**
     * Check if email is verified
     *
     * @return bool
     */
    public function hasVerifiedEmail()
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Mark email as verified
     *
     * @return bool
     */
    public function markEmailAsVerified()
    {
        $this->email_verified_at = date('Y-m-d H:i:s');
        return $this->save(false, ['email_verified_at']);
    }

    /**
     * {@inheritdoc}
     */
    public function beforeSave($insert)
    {
        if (!parent::beforeSave($insert)) {
            return false;
        }

        if ($insert) {
            if (empty($this->role)) {
                $this->role = self::ROLE_USER;
            }
            if (empty($this->remember_token)) {
                $this->generateRememberToken();
            }
        }

        if ($this->password !== null && $this->password !== '') {
            $this->setAttribute('password', Yii::$app->security->generatePasswordHash($this->password));
            $this->password = null;
            $this->password_confirm = null;
            if (!$insert) {
                // A password change signs out other sessions and remember-me cookies
                $this->generateRememberToken();
            }
        }

        if (!$insert && $this->isAttributeChanged('email', false)) {
            $this->email_verified_at = null;
        }

        return true;
    }
}
