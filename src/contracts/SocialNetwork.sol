pragma solidity^0.5.0;

contract SocialNetwork{
    string public name; //value gets stored in blockchain itself
    uint public postCount = 0;
    mapping(uint => Post) public posts; //like hashmap (for storing post directly in blockchain)

    struct Post{
        uint id; //unique identifier for post(unsigned int)
        string content;
        uint tipAmount;
        address payable author; //to make sure address is valid and payable
    }
    
    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor() public{
        name = "Amity University Social Network";
    }

    function createPost(string memory _content) public {
        //Require valid content
        require(bytes(_content).length > 0); //if its not valid(false), lines below won't be executed
        
        //Increment the post count
        postCount ++;
        //Create the post
        posts[postCount] = Post(postCount, _content, 0, msg.sender);
        //Trigger Event (to track values stored inside post)
        emit PostCreated(postCount, _content, 0, msg.sender);
    }

    function tipPost(uint _id) public payable{ //'payable' to enable it to accept Ether
        //Make sure the id is valid
        require(_id>0 && _id <= postCount);
        //Fetch the post (through mapping uint->key and post->value)
        Post memory _post = posts[_id];
        //Fetch the author
        address payable _author = _post.author;
        //Pay the author by sending them Ether
        address(_author).transfer(msg.value);
        //Increment the tip amount
        //msg.value is in Wei(to avoid float numbers)
        //1 Ether == 1000000000000000000 Wei
        _post.tipAmount = _post.tipAmount + msg.value;
        //Update the post
        posts[_id] = _post;
        //Trigger an event
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }
}