import { Community, communityState } from "@/atoms/communitiesAtom";
import { firestore } from "@/firebase/clientApp";
import { SearchIcon } from "@chakra-ui/icons";
import {
  Card,
  CardBody,
  Flex,
  Input,
  InputGroup,
  Text,
  InputLeftElement,
  Icon,
  Image,
  Link,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import { query, collection, orderBy, limit, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaReddit } from "react-icons/fa";
import { useRecoilValue } from "recoil";

type SearchInputProps = {
  user?: User | null;
};

const SearchInput: React.FC<SearchInputProps> = ({ user }) => {
  const [input, setInput] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  const getCommunityRecommendations = async () => {
    setLoading(true);

    try {
      const communityQuery = query(
        collection(firestore, "communities"),
        orderBy("numberOfMembers", "desc")
      );

      const communityDocs = await getDocs(communityQuery);
      const communities = communityDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCommunities(communities as Community[]);
    } catch (error) {
      console.log("getCommunityRecommendations error", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCommunityRecommendations();
  }, []);

  const results = communities.filter((community) => {
    return (
      community && community.id && community.id.toLowerCase().includes(input)
    );
  });

  return (
    <Flex
      flexGrow={1}
      maxWidth={user ? "auto" : "600px"}
      mr={2}
      align="center"
      direction="column"
    >
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" mb={1} />
        </InputLeftElement>
        <Input
          placeholder="Search Reddit"
          fontSize="10pt"
          _placeholder={{ color: "gray.500" }}
          _hover={{ bg: "white", border: "1px solid", borderColor: "blue.500" }}
          _focus={{
            outline: "none",
            border: "1px solid",
            borderColor: "blue.500",
          }}
          height="34px"
          bg="gray.50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </InputGroup>
      {input && (
        <Card zIndex={10} width="lg">
          {results.length ? (
            <CardBody>
              {results.map((item) => {
                return (
                  <Link key={item.id} href={`/r/${item.id}`} onClick={() => setInput('')}>
                    <Flex
                      position="relative"
                      align="center"
                      fontSize="10pt"
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      p="10px 12px"
                      fontWeight={600}
                    >
                      <Flex width="80%" align="center">
                        <Flex align="center" width="80%">
                          {item.imageUrl ? (
                            <Image
                              borderRadius="full"
                              boxSize="28px"
                              src={item.imageUrl}
                              mr={2}
                            />
                          ) : (
                            <Icon
                              as={FaReddit}
                              fontSize={30}
                              color="brand.100"
                              mr={2}
                            />
                          )}
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >{`r/${item.id}`}</span>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Link>
                );
              })}
            </CardBody>
          ) : (
            <CardBody>
              <Text>No match found</Text>
            </CardBody>
          )}
        </Card>
      )}
    </Flex>
  );
};
export default SearchInput;
